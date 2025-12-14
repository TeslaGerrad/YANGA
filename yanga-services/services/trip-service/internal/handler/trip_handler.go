package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/namycodes/yanga-services/services/trip-service/internal/service"
	"github.com/namycodes/yanga-services/shared-lib/domain"
	"github.com/namycodes/yanga-services/shared-lib/utils"
)

type TripHandler struct {
	tripService *service.TripService
}

func NewTripHandler(tripService *service.TripService) *TripHandler {
	return &TripHandler{
		tripService: tripService,
	}
}

// CreateTrip godoc
// @Summary Create a new trip
// @Tags trips
// @Accept json
// @Produce json
// @Param request body domain.CreateTripRequest true "Trip details"
// @Success 201 {object} domain.SuccessResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /trips [post]
// @Security BearerAuth
func (h *TripHandler) CreateTrip(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateTripRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	userIDStr := r.Context().Value("user_id").(string)
	userID, err := utils.ParseUUID(userIDStr)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	trip, err := h.tripService.CreateTrip(r.Context(), userID, &req)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Trip created successfully", trip)
}

// GetTrip godoc
// @Summary Get trip by ID
// @Tags trips
// @Produce json
// @Param id path string true "Trip ID"
// @Success 200 {object} domain.SuccessResponse
// @Failure 404 {object} domain.ErrorResponse
// @Router /trips/{id} [get]
// @Security BearerAuth
func (h *TripHandler) GetTrip(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tripIDStr := vars["id"]

	tripID, err := utils.ParseUUID(tripIDStr)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid trip ID")
		return
	}

	trip, err := h.tripService.GetTripByID(r.Context(), tripID)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Trip retrieved successfully", trip)
}

// GetUserTrips godoc
// @Summary Get user's trips
// @Tags trips
// @Produce json
// @Param limit query int false "Limit" default(10)
// @Param offset query int false "Offset" default(0)
// @Success 200 {object} domain.SuccessResponse
// @Router /trips/user [get]
// @Security BearerAuth
func (h *TripHandler) GetUserTrips(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Context().Value("user_id").(string)
	userID, err := utils.ParseUUID(userIDStr)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	trips, err := h.tripService.GetUserTrips(r.Context(), userID)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Trips retrieved successfully", trips)
}

// CancelTrip godoc
// @Summary Cancel a trip
// @Tags trips
// @Accept json
// @Produce json
// @Param id path string true "Trip ID"
// @Param request body domain.CancelTripRequest true "Cancellation details"
// @Success 200 {object} domain.SuccessResponse
// @Failure 400 {object} domain.ErrorResponse
// @Router /trips/{id}/cancel [post]
// @Security BearerAuth
func (h *TripHandler) CancelTrip(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tripIDStr := vars["id"]

	tripID, err := utils.ParseUUID(tripIDStr)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid trip ID")
		return
	}

	var req domain.CancelTripRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	err = h.tripService.CancelTrip(r.Context(), tripID, req.Reason)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Trip cancelled successfully", nil)
}
