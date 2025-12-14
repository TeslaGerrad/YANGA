package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/namycodes/yanga-services/services/rating-service/internal/service"
	"github.com/namycodes/yanga-services/shared-lib/domain"
	"github.com/namycodes/yanga-services/shared-lib/utils"
)

type RatingHandler struct {
	ratingService *service.RatingService
}

func NewRatingHandler(ratingService *service.RatingService) *RatingHandler {
	return &RatingHandler{
		ratingService: ratingService,
	}
}

// CreateRating godoc
// @Summary Create a rating
// @Tags ratings
// @Accept json
// @Produce json
// @Param request body domain.CreateRatingRequest true "Rating details"
// @Success 201 {object} domain.RatingResponse
// @Failure 400 {object} domain.ErrorResponse
// @Router /ratings [post]
// @Security BearerAuth
func (h *RatingHandler) CreateRating(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateRatingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID := r.Context().Value("user_id").(string)
	req.RaterID = userID

	response, err := h.ratingService.CreateRating(r.Context(), &req)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Rating created successfully", response)
}

// GetTripRating godoc
// @Summary Get rating for a trip
// @Tags ratings
// @Produce json
// @Param trip_id path string true "Trip ID"
// @Success 200 {object} domain.RatingResponse
// @Failure 404 {object} domain.ErrorResponse
// @Router /ratings/trip/{trip_id} [get]
// @Security BearerAuth
func (h *RatingHandler) GetTripRating(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tripID := vars["trip_id"]

	response, err := h.ratingService.GetTripRating(r.Context(), tripID)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Rating retrieved successfully", response)
}

// GetDriverRatings godoc
// @Summary Get driver ratings
// @Tags ratings
// @Produce json
// @Param driver_id path string true "Driver ID"
// @Success 200 {array} domain.RatingResponse
// @Router /ratings/driver/{driver_id} [get]
func (h *RatingHandler) GetDriverRatings(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	driverID := vars["driver_id"]

	ratings, err := h.ratingService.GetDriverRatings(r.Context(), driverID, 10, 0)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Ratings retrieved successfully", ratings)
}

// GetDriverAverageRating godoc
// @Summary Get driver average rating
// @Tags ratings
// @Produce json
// @Param driver_id path string true "Driver ID"
// @Success 200 {object} domain.AverageRatingResponse
// @Router /ratings/driver/{driver_id}/average [get]
func (h *RatingHandler) GetDriverAverageRating(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	driverID := vars["driver_id"]

	avgRating, err := h.ratingService.GetAverageDriverRating(r.Context(), driverID)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Average rating retrieved", map[string]interface{}{
		"driver_id":      driverID,
		"average_rating": avgRating,
	})
}
