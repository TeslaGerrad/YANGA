package routes

import (
	"github.com/gorilla/mux"
	"github.com/namycodes/yanga-services/services/auth-service/internal/handler"
	httpSwagger "github.com/swaggo/http-swagger"
)

// SetupAuthRoutes configures all authentication routes
func SetupAuthRoutes(router *mux.Router, authHandler *handler.AuthHandler) {
	// API v1 routes
	api := router.PathPrefix("/api/v1").Subrouter()

	// Public routes (no authentication required)
	public := api.PathPrefix("/auth").Subrouter()
	public.HandleFunc("/register", authHandler.Register).Methods("POST")
	public.HandleFunc("/login", authHandler.Login).Methods("POST")
	public.HandleFunc("/verify-phone", authHandler.VerifyPhone).Methods("POST")
	public.HandleFunc("/resend-otp", authHandler.ResendOTP).Methods("POST")
	public.HandleFunc("/forgot-password", authHandler.ForgotPassword).Methods("POST")
	public.HandleFunc("/reset-password", authHandler.ResetPassword).Methods("POST")
	public.HandleFunc("/refresh-token", authHandler.RefreshToken).Methods("POST")

	// Swagger documentation
	router.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)
}
