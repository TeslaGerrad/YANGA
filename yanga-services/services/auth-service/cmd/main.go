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
	_ "github.com/namycodes/yanga-services/services/auth-service/docs"
	"github.com/namycodes/yanga-services/services/auth-service/internal/db"
	"github.com/namycodes/yanga-services/services/auth-service/internal/handler"
	"github.com/namycodes/yanga-services/services/auth-service/internal/repository"
	"github.com/namycodes/yanga-services/services/auth-service/internal/routes"
	"github.com/namycodes/yanga-services/services/auth-service/internal/service"
	"github.com/namycodes/yanga-services/shared-lib/config"
	"github.com/namycodes/yanga-services/shared-lib/events"
	"github.com/namycodes/yanga-services/shared-lib/middleware"
)

// @title Auth Service API
// @version 1.0
// @description Authentication and user management service
// @host localhost:8081
// @BasePath /api/v1
func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database connection
	dbPool, err := pgxpool.New(context.Background(), cfg.DatabaseURL())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbPool.Close()

	// Test database connection
	if err := dbPool.Ping(context.Background()); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("✅ Connected to database")

	// Initialize event bus
	eventBus, err := events.NewNATSEventBus(cfg.NatsURL)
	if err != nil {
		log.Fatalf("Failed to connect to NATS: %v", err)
	}
	defer eventBus.Close()
	log.Println("✅ Connected to NATS")

	// Initialize sqlc queries
	queries := db.New(dbPool)

	// Initialize layers
	authRepo := repository.NewAuthRepository(queries)
	authService := service.NewAuthService(authRepo, eventBus, cfg)
	authHandler := handler.NewAuthHandler(authService)

	// Setup router
	router := mux.NewRouter()

	// Setup middleware
	router.Use(middleware.LoggingMiddleware)
	router.Use(middleware.CORSMiddleware)

	// Setup routes
	routes.SetupAuthRoutes(router, authHandler)

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	}).Methods("GET")

	// Start server
	addr := fmt.Sprintf("%s:%s", cfg.ServiceHost, cfg.ServicePort)
	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Printf("🚀 Auth Service starting on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Graceful shutdown
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


