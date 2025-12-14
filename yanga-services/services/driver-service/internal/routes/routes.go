package routes

import (
	"github.com/gorilla/mux"
	"github.com/namycodes/yanga-services/services/driver-service/internal/handler"
	"github.com/namycodes/yanga-services/shared-lib/config"
	"github.com/namycodes/yanga-services/shared-lib/middleware"
	httpSwagger "github.com/swaggo/http-swagger"
)

func SetupDriverRoutes(router *mux.Router, driverHandler *handler.DriverHandler, jwtCfg config.JWTConfig) {
	api := router.PathPrefix("/api/v1").Subrouter()

	// Protected routes - require authentication
	drivers := api.PathPrefix("/drivers").Subrouter()
	drivers.Use(middleware.AuthMiddleware(jwtCfg.Secret))

	// Driver profile management
	drivers.HandleFunc("/profile", driverHandler.UpdateProfile).Methods("PUT")
	drivers.HandleFunc("/status", driverHandler.ToggleStatus).Methods("POST")
	drivers.HandleFunc("/location", driverHandler.UpdateLocation).Methods("PUT")

	// Driver trips
	drivers.HandleFunc("/trips", driverHandler.GetTrips).Methods("GET")
	drivers.HandleFunc("/trips/{id}/accept", driverHandler.AcceptTrip).Methods("POST")
	drivers.HandleFunc("/trips/{id}/start", driverHandler.StartTrip).Methods("POST")
	drivers.HandleFunc("/trips/{id}/complete", driverHandler.CompleteTrip).Methods("POST")

	// Swagger documentation
	router.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)
}
