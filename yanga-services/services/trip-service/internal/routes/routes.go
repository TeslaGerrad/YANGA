package routes

import (
	"github.com/gorilla/mux"
	"github.com/namycodes/yanga-services/services/trip-service/internal/handler"
	"github.com/namycodes/yanga-services/shared-lib/config"
	"github.com/namycodes/yanga-services/shared-lib/middleware"
	httpSwagger "github.com/swaggo/http-swagger"
)

func SetupTripRoutes(router *mux.Router, tripHandler *handler.TripHandler, jwtCfg config.JWTConfig) {
	api := router.PathPrefix("/api/v1").Subrouter()

	trips := api.PathPrefix("/trips").Subrouter()
	trips.Use(middleware.AuthMiddleware(jwtCfg.Secret))

	trips.HandleFunc("", tripHandler.CreateTrip).Methods("POST")
	trips.HandleFunc("/{id}", tripHandler.GetTrip).Methods("GET")
	trips.HandleFunc("/user", tripHandler.GetUserTrips).Methods("GET")
	trips.HandleFunc("/{id}/cancel", tripHandler.CancelTrip).Methods("POST")

	router.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)
}
