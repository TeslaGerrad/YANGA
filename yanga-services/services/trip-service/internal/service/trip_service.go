package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/namycodes/yanga-services/services/trip-service/internal/db"
	"github.com/namycodes/yanga-services/services/trip-service/internal/repository"
	"github.com/namycodes/yanga-services/shared-lib/domain"
	"github.com/namycodes/yanga-services/shared-lib/events"
	"github.com/namycodes/yanga-services/shared-lib/utils"
)

type TripService struct {
	tripRepo        *repository.TripRepository
	rideRequestRepo *repository.RideRequestRepository
	eventBus        events.EventBus
}

func NewTripService(tripRepo *repository.TripRepository, rideRequestRepo *repository.RideRequestRepository, eventBus events.EventBus) *TripService {
	return &TripService{
		tripRepo:        tripRepo,
		rideRequestRepo: rideRequestRepo,
		eventBus:        eventBus,
	}
}

func (s *TripService) CreateTrip(ctx context.Context, userID uuid.UUID, req *domain.CreateTripRequest) (*db.Trip, error) {
	if err := s.validateCreateTripRequest(req); err != nil {
		return nil, err
	}

	// Calculate distance and estimated fare
	distance := utils.CalculateDistance(
		req.PickupLatitude, req.PickupLongitude,
		req.DropoffLatitude, req.DropoffLongitude,
	)
	estimatedFare := s.calculateFare(distance)

	// Convert UUID to pgtype.UUID
	var userPGUUID pgtype.UUID
	if err := userPGUUID.Scan(userID); err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	// Convert floats to pgtype.Numeric
	var pickupLat, pickupLong, dropoffLat, dropoffLong, estimatedFareNum, distanceNum pgtype.Numeric
	pickupLat.Scan(fmt.Sprintf("%f", req.PickupLatitude))
	pickupLong.Scan(fmt.Sprintf("%f", req.PickupLongitude))
	dropoffLat.Scan(fmt.Sprintf("%f", req.DropoffLatitude))
	dropoffLong.Scan(fmt.Sprintf("%f", req.DropoffLongitude))
	estimatedFareNum.Scan(fmt.Sprintf("%f", estimatedFare))
	distanceNum.Scan(fmt.Sprintf("%f", distance))

	params := db.CreateTripParams{
		UserID:           userPGUUID,
		PickupLatitude:   pickupLat,
		PickupLongitude:  pickupLong,
		PickupAddress:    req.PickupAddress,
		DropoffLatitude:  dropoffLat,
		DropoffLongitude: dropoffLong,
		DropoffAddress:   req.DropoffAddress,
		EstimatedFare:    estimatedFareNum,
		Distance:         distanceNum,
		EstimatedDuration: pgtype.Int4{Int32: int32(distance * 2), Valid: true}, // Simple estimation
	}

	trip, err := s.tripRepo.CreateTrip(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to create trip: %w", err)
	}

	return &trip, nil
}

func (s *TripService) GetTripByID(ctx context.Context, tripID uuid.UUID) (*db.Trip, error) {
	var pgUUID pgtype.UUID
	if err := pgUUID.Scan(tripID); err != nil {
		return nil, fmt.Errorf("invalid trip ID: %w", err)
	}

	trip, err := s.tripRepo.GetTrip(ctx, pgUUID)
	if err != nil {
		return nil, errors.New("trip not found")
	}
	return &trip, nil
}

func (s *TripService) GetUserTrips(ctx context.Context, userID uuid.UUID) ([]db.Trip, error) {
	var pgUUID pgtype.UUID
	if err := pgUUID.Scan(userID); err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	return s.tripRepo.GetUserTrips(ctx, db.GetUserTripsParams{
		UserID: pgUUID,
		Limit:  10,
		Offset: 0,
	})
}

func (s *TripService) GetActiveTrip(ctx context.Context, userID uuid.UUID) (*db.Trip, error) {
	var pgUUID pgtype.UUID
	if err := pgUUID.Scan(userID); err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	trip, err := s.tripRepo.GetActiveTrip(ctx, pgUUID)
	if err != nil {
		return nil, errors.New("no active trip found")
	}
	return &trip, nil
}

func (s *TripService) CancelTrip(ctx context.Context, tripID uuid.UUID, reason string) error {
	var pgUUID pgtype.UUID
	if err := pgUUID.Scan(tripID); err != nil {
		return fmt.Errorf("invalid trip ID: %w", err)
	}

	trip, err := s.tripRepo.GetTrip(ctx, pgUUID)
	if err != nil {
		return errors.New("trip not found")
	}

	if trip.Status == domain.TripStatusCompleted || trip.Status == domain.TripStatusCancelled {
		return errors.New("cannot cancel completed or already cancelled trip")
	}

	reasonPtr := pgtype.Text{String: reason, Valid: true}
	
	err = s.tripRepo.CancelTrip(ctx, db.CancelTripParams{
		ID:                 pgUUID,
		CancellationReason: reasonPtr,
	})
	if err != nil {
		return fmt.Errorf("failed to cancel trip: %w", err)
	}

	return nil
}

func (s *TripService) CompleteTrip(ctx context.Context, tripID uuid.UUID, actualFare float64, actualDuration int32) error {
	var pgUUID pgtype.UUID
	if err := pgUUID.Scan(tripID); err != nil {
		return fmt.Errorf("invalid trip ID: %w", err)
	}

	trip, err := s.tripRepo.GetTrip(ctx, pgUUID)
	if err != nil {
		return errors.New("trip not found")
	}

	if trip.Status != domain.TripStatusInProgress {
		return errors.New("only in-progress trips can be completed")
	}

	var fareNum pgtype.Numeric
	fareNum.Scan(fmt.Sprintf("%f", actualFare))
	
	durationPtr := pgtype.Int4{Int32: actualDuration, Valid: true}
	paymentStatus := pgtype.Text{String: "completed", Valid: true}

	err = s.tripRepo.CompleteTrip(ctx, db.CompleteTripParams{
		ID:             pgUUID,
		ActualFare:     fareNum,
		ActualDuration: durationPtr,
		PaymentStatus:  paymentStatus,
	})
	if err != nil {
		return fmt.Errorf("failed to complete trip: %w", err)
	}

	return nil
}

func (s *TripService) SubscribeToEvents() {
	// Subscribe to trip accepted event from driver service
	s.eventBus.Subscribe(events.SubjectTripAccepted, func(data []byte) {
		var event struct {
			TripID   string `json:"trip_id"`
			DriverID string `json:"driver_id"`
		}
		if err := json.Unmarshal(data, &event); err != nil {
			log.Printf("Failed to unmarshal trip accepted event: %v", err)
			return
		}

		tripID, err := uuid.Parse(event.TripID)
		if err != nil {
			log.Printf("Invalid trip ID in event: %v", err)
			return
		}

		driverID, err := uuid.Parse(event.DriverID)
		if err != nil {
			log.Printf("Invalid driver ID in event: %v", err)
			return
		}

		var tripPGUUID, driverPGUUID pgtype.UUID
		tripPGUUID.Scan(tripID)
		driverPGUUID.Scan(driverID)

		ctx := context.Background()
		if err := s.tripRepo.AssignDriverToTrip(ctx, db.AssignDriverToTripParams{
			ID:       tripPGUUID,
			DriverID: driverPGUUID,
		}); err != nil {
			log.Printf("Failed to assign driver to trip: %v", err)
			return
		}

		log.Printf("Trip %s assigned to driver %s", event.TripID, event.DriverID)
	})

	// Subscribe to trip started event
	s.eventBus.Subscribe(events.SubjectTripStarted, func(data []byte) {
		var event struct {
			TripID string `json:"trip_id"`
		}
		if err := json.Unmarshal(data, &event); err != nil {
			log.Printf("Failed to unmarshal trip started event: %v", err)
			return
		}

		tripID, err := uuid.Parse(event.TripID)
		if err != nil {
			log.Printf("Invalid trip ID in event: %v", err)
			return
		}

		var tripPGUUID pgtype.UUID
		tripPGUUID.Scan(tripID)

		ctx := context.Background()
		if err := s.tripRepo.UpdateTripStatus(ctx, db.UpdateTripStatusParams{
			ID:     tripPGUUID,
			Status: domain.TripStatusInProgress,
		}); err != nil {
			log.Printf("Failed to update trip status: %v", err)
			return
		}

		log.Printf("Trip %s started", event.TripID)
	})
}

func (s *TripService) validateCreateTripRequest(req *domain.CreateTripRequest) error {
	if req.PickupLatitude == 0 || req.PickupLongitude == 0 {
		return errors.New("pickup location is required")
	}
	if req.DropoffLatitude == 0 || req.DropoffLongitude == 0 {
		return errors.New("dropoff location is required")
	}
	return nil
}

func (s *TripService) calculateFare(distance float64) float64 {
	// Simple fare calculation: base fare + per km rate
	baseFare := 50.0  // Base fare
	perKmRate := 20.0 // Rate per kilometer
	return baseFare + (distance * perKmRate)
}
