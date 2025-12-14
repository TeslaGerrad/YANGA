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





















































































































}	log.Println("Server exited gracefully")	}		log.Fatalf("Server forced to shutdown: %v", err)	if err := srv.Shutdown(ctx); err != nil {	defer cancel()	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)	log.Println("Shutting down server...")	<-quit	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)	quit := make(chan os.Signal, 1)	// Graceful shutdown	}()		}			log.Fatalf("Failed to start server: %v", err)		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {		log.Printf("Auth Service starting on %s", addr)	go func() {	// Start server in a goroutine	}		IdleTimeout:  60 * time.Second,		WriteTimeout: 15 * time.Second,		ReadTimeout:  15 * time.Second,		Handler:      router,		Addr:         addr,	srv := &http.Server{	addr := fmt.Sprintf("%s:%s", cfg.Service.Host, cfg.Service.Port)	// Create HTTP server	}).Methods("GET")		w.Write([]byte(`{"status":"healthy"}`))		w.WriteHeader(http.StatusOK)	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {	// Health check endpoint	routes.SetupAuthRoutes(router, authHandler)	// Setup routes	router.Use(middleware.CORSMiddleware)	router.Use(middleware.LoggingMiddleware)	// Apply middleware	router := mux.NewRouter()	// Initialize router	authHandler := handler.NewAuthHandler(authService)	authService := service.NewAuthService(userRepo, eventBus, cfg.JWT)	userRepo := repository.NewUserRepository(db)	// Initialize repository, service, and handler layers	defer eventBus.Close()	}		log.Fatalf("Failed to connect to NATS: %v", err)	if err != nil {	eventBus, err := events.NewEventBus(cfg.NATS.URL)	// Initialize event bus	defer db.Close()	}		log.Fatalf("Failed to connect to database: %v", err)	if err != nil {	db, err := database.NewDB(cfg.Database)	// Initialize database connection	cfg := config.LoadConfig()	// Load configurationfunc main() {// @description Type "Bearer" followed by a space and JWT token.// @name Authorization// @in header// @securityDefinitions.apikey BearerAuth// @schemes http https// @BasePath /api/v1// @host localhost:8081// @license.url https://opensource.org/licenses/MIT// @license.name MIT// @contact.email support@yanga.com// @contact.url http://www.yanga.com/support// @contact.name API Support// @termsOfService http://swagger.io/terms/// @description Authentication and user management service for Yanga Rides// @version 1.0// @title Auth Service API)	"github.com/namycodes/yanga-services/shared-lib/middleware"	"github.com/namycodes/yanga-services/shared-lib/events"	"github.com/namycodes/yanga-services/shared-lib/database"	"github.com/namycodes/yanga-services/shared-lib/config"	"github.com/namycodes/yanga-services/services/auth-service/internal/service"	"github.com/namycodes/yanga-services/services/auth-service/internal/routes"	"github.com/namycodes/yanga-services/services/auth-service/internal/repository"	"github.com/namycodes/yanga-services/services/auth-service/internal/handler"	"github.com/gorilla/mux"	"time"	"syscall"	"os/signal"	"os"	"net/http"	"log"	"fmt"	"context"import (