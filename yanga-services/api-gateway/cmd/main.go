package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/namycodes/yanga-services/shared-lib/config"
	"github.com/namycodes/yanga-services/shared-lib/middleware"
	httpSwagger "github.com/swaggo/http-swagger"
)

// @title Yanga Rides API Gateway
// @version 1.0
// @description API Gateway for Yanga Rides microservices
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@yanga.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /
// @schemes http https

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func main() {
	cfg := config.LoadConfig()

	router := mux.NewRouter()
	router.Use(middleware.LoggingMiddleware)
	router.Use(middleware.CORSMiddleware)

	// Service URLs
	authServiceURL := getServiceURL("AUTH_SERVICE_URL", "http://localhost:8081")
	tripServiceURL := getServiceURL("TRIP_SERVICE_URL", "http://localhost:8082")
	driverServiceURL := getServiceURL("DRIVER_SERVICE_URL", "http://localhost:8083")
	ratingServiceURL := getServiceURL("RATING_SERVICE_URL", "http://localhost:8084")

	// Create reverse proxies
	authProxy := createReverseProxy(authServiceURL)
	tripProxy := createReverseProxy(tripServiceURL)
	driverProxy := createReverseProxy(driverServiceURL)
	ratingProxy := createReverseProxy(ratingServiceURL)

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","service":"api-gateway"}`))
	}).Methods("GET")

	// Route to services
	router.PathPrefix("/api/v1/auth").Handler(authProxy)
	router.PathPrefix("/api/v1/trips").Handler(tripProxy)
	router.PathPrefix("/api/v1/ride-requests").Handler(tripProxy)
	router.PathPrefix("/api/v1/drivers").Handler(driverProxy)
	router.PathPrefix("/api/v1/ratings").Handler(ratingProxy)

	// Swagger documentation - aggregate from all services
	router.PathPrefix("/swagger/").Handler(httpSwagger.Handler(
		httpSwagger.URL("/swagger/doc.json"),
	))

	// API documentation landing page
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(`
<!DOCTYPE html>
<html>
<head>
	<title>Yanga Rides API</title>
	<style>
		body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
		h1 { color: #333; }
		.service { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
		.service h3 { margin-top: 0; color: #0066cc; }
		a { color: #0066cc; text-decoration: none; }
		a:hover { text-decoration: underline; }
	</style>
</head>
<body>
	<h1>Yanga Rides API Gateway</h1>
	<p>Welcome to the Yanga Rides microservices API. Access documentation for each service below:</p>
	
	<div class="service">
		<h3>Auth Service (Port 8081)</h3>
		<p>User authentication, registration, and password management</p>
		<a href="/swagger/">View Documentation</a>
	</div>
	
	<div class="service">
		<h3>Trip Service (Port 8082)</h3>
		<p>Trip creation, management, and ride requests</p>
		<a href="/swagger/">View Documentation</a>
	</div>
	
	<div class="service">
		<h3>Driver Service (Port 8083)</h3>
		<p>Driver profile, status, location, and trip operations</p>
		<a href="/swagger/">View Documentation</a>
	</div>
	
	<div class="service">
		<h3>Rating Service (Port 8084)</h3>
		<p>User and driver ratings after trip completion</p>
		<a href="/swagger/">View Documentation</a>
	</div>
	
	<hr>
	<p><strong>Health Check:</strong> <a href="/health">Check Gateway Status</a></p>
</body>
</html>
		`))
	}).Methods("GET")

	addr := fmt.Sprintf("%s:%s", cfg.Service.Host, cfg.Service.Port)
	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("API Gateway starting on %s", addr)
		log.Printf("Auth Service: %s", authServiceURL)
		log.Printf("Trip Service: %s", tripServiceURL)
		log.Printf("Driver Service: %s", driverServiceURL)
		log.Printf("Rating Service: %s", ratingServiceURL)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down API Gateway...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("API Gateway exited gracefully")
}

func createReverseProxy(targetURL string) http.Handler {
	target, err := url.Parse(targetURL)
	if err != nil {
		log.Fatalf("Failed to parse service URL %s: %v", targetURL, err)
	}

	proxy := httputil.NewSingleHostReverseProxy(target)

	// Custom error handler
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("Proxy error: %v", err)
		w.WriteHeader(http.StatusBadGateway)
		w.Write([]byte(`{"error":"Service temporarily unavailable"}`))
	}

	return proxy
}

func getServiceURL(envKey, defaultURL string) string {
	if url := os.Getenv(envKey); url != "" {
		return url
	}
	return defaultURL
}
