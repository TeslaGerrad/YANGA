package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/namycodes/yanga-services/services/rating-service/docs"
	"github.com/namycodes/yanga-services/services/rating-service/internal/db"
	"github.com/namycodes/yanga-services/services/rating-service/internal/handler"
	"github.com/namycodes/yanga-services/services/rating-service/internal/repository"
	"github.com/namycodes/yanga-services/services/rating-service/internal/routes"
	"github.com/namycodes/yanga-services/services/rating-service/internal/service"
	"github.com/namycodes/yanga-services/shared-lib/config"
	"github.com/namycodes/yanga-services/shared-lib/events"
	"github.com/namycodes/yanga-services/shared-lib/middleware"
)

// @title Rating Service API
// @version 1.0
// @description Rating and feedback management service
// @host localhost:8084
// @BasePath /api/v1
func main() {
	cfg := config.Load()

	dbPool, err := pgxpool.New(context.Background(), cfg.DatabaseURL())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbPool.Close()

	if err := dbPool.Ping(context.Background()); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("✅ Connected to database")

	eventBus, err := events.NewNATSEventBus(cfg.NatsURL)
	if err != nil {
		log.Fatalf("Failed to connect to NATS: %v", err)
	}
	defer eventBus.Close()
	log.Println("✅ Connected to NATS")

	queries := db.New(dbPool)
	ratingRepo := repository.NewRatingRepository(queries)
	ratingService := service.NewRatingService(ratingRepo, eventBus)
	ratingHandler := handler.NewRatingHandler(ratingService)

	router := mux.NewRouter()
	router.Use(middleware.LoggingMiddleware)
	router.Use(middleware.CORSMiddleware)

	routes.SetupRatingRoutes(router, ratingHandler, config.JWTConfig{Secret: cfg.JWTSecret})

	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	}).Methods("GET")

	addr := fmt.Sprintf("%s:%s", cfg.ServiceHost, cfg.ServicePort)
	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("🚀 Rating Service starting on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("✅ Server exited gracefully")
}
