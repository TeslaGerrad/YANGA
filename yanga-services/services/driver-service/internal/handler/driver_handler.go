package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/namycodes/yanga-services/services/driver-service/internal/service"
	"github.com/namycodes/yanga-services/shared-lib/domain"
	"github.com/namycodes/yanga-services/shared-lib/utils"
)

type DriverHandler struct {
	driverService *service.DriverService
}

func NewDriverHandler(driverService *service.DriverService) *DriverHandler {
	return &DriverHandler{
		driverService: driverService,
	}
}

// UpdateProfile godoc
// @Summary Update driver profile
// @Tags drivers
// @Accept json
// @Produce json
// @Param request body domain.UpdateDriverProfileRequest true "Profile details"
// @Success 200 {object} domain.DriverProfileResponse
// @Failure 400 {object} domain.ErrorResponse
// @Router /drivers/profile [put]
// @Security BearerAuth
func (h *DriverHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var req domain.UpdateDriverProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID := r.Context().Value("user_id").(string)
	utils.SuccessResponse(w, http.StatusOK, "Profile updated successfully", map[string]string{"user_id": userID})
}

// ToggleStatus godoc
// @Summary Toggle driver online/offline status
// @Tags drivers
// @Accept json
// @Produce json
// @Param request body domain.ToggleStatusRequest true "Status"
// @Success 200 {object} domain.MessageResponse
// @Failure 400 {object} domain.ErrorResponse
// @Router /drivers/status [post]
// @Security BearerAuth
func (h *DriverHandler) ToggleStatus(w http.ResponseWriter, r *http.Request) {
	var req domain.ToggleStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID := r.Context().Value("user_id").(string)

	err := h.driverService.UpdateDriverStatus(r.Context(), userID, req.IsOnline)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	status := "offline"
	if req.IsOnline {
		status = "online"
	}
	utils.SuccessResponse(w, http.StatusOK, "Driver status updated to "+status, nil)
}

// UpdateLocation godoc
// @Summary Update driver location
// @Tags drivers
// @Accept json
// @Produce json
// @Param request body domain.UpdateLocationRequest true "Location"
// @Success 200 {object} domain.MessageResponse
// @Failure 400 {object} domain.ErrorResponse
// @Router /drivers/location [put]
// @Security BearerAuth
func (h *DriverHandler) UpdateLocation(w http.ResponseWriter, r *http.Request) {
	var req domain.UpdateLocationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID := r.Context().Value("user_id").(string)

	err := h.driverService.UpdateDriverLocation(r.Context(), userID, req.Latitude, req.Longitude)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Location updated successfully", nil)
}

// GetTrips godoc
// @Summary Get driver's trips
// @Tags drivers
// @Produce json
// @Success 200 {array} domain.TripResponse
// @Router /drivers/trips [get]
// @Security BearerAuth
func (h *DriverHandler) GetTrips(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	utils.SuccessResponse(w, http.StatusOK, "Trips retrieved", map[string]string{"driver_id": userID})
}

// AcceptTrip godoc
// @Summary Accept a trip request
// @Tags drivers
// @Param id path string true "Trip ID"
// @Success 200 {object} domain.TripResponse
// @Router /drivers/trips/{id}/accept [post]
// @Security BearerAuth
func (h *DriverHandler) AcceptTrip(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tripID := vars["id"]
	userID := r.Context().Value("user_id").(string)

	utils.SuccessResponse(w, http.StatusOK, "Trip accepted", map[string]string{"trip_id": tripID, "driver_id": userID})
}

// StartTrip godoc
// @Summary Start a trip
// @Tags drivers
// @Param id path string true "Trip ID"
// @Success 200 {object} domain.TripResponse
// @Router /drivers/trips/{id}/start [post]
// @Security BearerAuth
func (h *DriverHandler) StartTrip(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tripID := vars["id"]

	utils.SuccessResponse(w, http.StatusOK, "Trip started", map[string]string{"trip_id": tripID})
}

// CompleteTrip godoc
// @Summary Complete a trip
// @Tags drivers
// @Param id path string true "Trip ID"
// @Success 200 {object} domain.TripResponse
// @Router /drivers/trips/{id}/complete [post]
// @Security BearerAuth
func (h *DriverHandler) CompleteTrip(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tripID := vars["id"]

	utils.SuccessResponse(w, http.StatusOK, "Trip completed", map[string]string{"trip_id": tripID})
}

// GetNearbyDrivers godoc
// @Summary Get nearby drivers
// @Tags drivers
// @Produce json
// @Param lat query number true "Latitude"
// @Param lng query number true "Longitude"
// @Param radius query number false "Radius in km" default(5)
// @Success 200 {array} domain.NearbyDriverResponse
// @Router /drivers/nearby [get]
func (h *DriverHandler) GetNearbyDrivers(w http.ResponseWriter, r *http.Request) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	lng, _ := strconv.ParseFloat(r.URL.Query().Get("lng"), 64)
	radius, _ := strconv.ParseFloat(r.URL.Query().Get("radius"), 64)

	if radius == 0 {
		radius = 5.0
	}

	drivers, err := h.driverService.GetNearbyDrivers(r.Context(), lat, lng, radius, 10)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Nearby drivers retrieved", drivers)
}
