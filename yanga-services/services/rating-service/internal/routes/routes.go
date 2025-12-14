package routes

import (
	"github.com/gorilla/mux"
	"github.com/namycodes/yanga-services/services/rating-service/internal/handler"
	"github.com/namycodes/yanga-services/shared-lib/config"
	"github.com/namycodes/yanga-services/shared-lib/middleware"
	httpSwagger "github.com/swaggo/http-swagger"
)

func SetupRatingRoutes(router *mux.Router, ratingHandler *handler.RatingHandler, jwtCfg config.JWTConfig) {
	api := router.PathPrefix("/api/v1").Subrouter()

	ratings := api.PathPrefix("/ratings").Subrouter()
	ratings.Use(middleware.AuthMiddleware(jwtCfg.Secret))

	ratings.HandleFunc("", ratingHandler.CreateRating).Methods("POST")
	ratings.HandleFunc("/trip/{trip_id}", ratingHandler.GetTripRating).Methods("GET")

	// Public endpoints
	public := api.PathPrefix("/ratings").Subrouter()
	public.HandleFunc("/driver/{driver_id}", ratingHandler.GetDriverRatings).Methods("GET")
	public.HandleFunc("/driver/{driver_id}/average", ratingHandler.GetDriverAverageRating).Methods("GET")

	router.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)
}
