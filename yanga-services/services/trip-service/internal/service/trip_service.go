package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/namycodes/yanga-services/services/trip-service/internal/repository"
	"github.com/namycodes/yanga-services/shared-lib/domain"
	"github.com/namycodes/yanga-services/shared-lib/events"
	"github.com/namycodes/yanga-services/shared-lib/utils"
)

type TripService struct {
	tripRepo        *repository.TripRepository
	rideRequestRepo *repository.RideRequestRepository
	eventBus        *events.EventBus
}

func NewTripService(tripRepo *repository.TripRepository, rideRequestRepo *repository.RideRequestRepository, eventBus *events.EventBus) *TripService {
	return &TripService{
		tripRepo:        tripRepo,
		rideRequestRepo: rideRequestRepo,
		eventBus:        eventBus,
	}
}

func (s *TripService) CreateTrip(ctx context.Context, userID uuid.UUID, req *domain.CreateTripRequest) (*domain.Trip, error) {
	if err := s.validateCreateTripRequest(req); err != nil {
		return nil, err
	}

	// Calculate distance and estimated fare
	distance := utils.CalculateDistance(
		req.PickupLatitude, req.PickupLongitude,
		req.DropoffLatitude, req.DropoffLongitude,
	)
	estimatedFare := s.calculateFare(distance)

	trip := &domain.Trip{
		ID:               uuid.New(),
		UserID:           userID,
		PickupLatitude:   req.PickupLatitude,
		PickupLongitude:  req.PickupLongitude,
		PickupAddress:    req.PickupAddress,
		DropoffLatitude:  req.DropoffLatitude,
		DropoffLongitude: req.DropoffLongitude,
		DropoffAddress:   req.DropoffAddress,
		Status:           domain.TripStatusRequested,
		EstimatedFare:    estimatedFare,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := s.tripRepo.Create(ctx, trip); err != nil {
		return nil, fmt.Errorf("failed to create trip: %w", err)
	}

	// Create ride request
	rideRequest := &domain.RideRequest{
		ID:               uuid.New(),
		TripID:           trip.ID,
		UserID:           userID,
		PickupLatitude:   req.PickupLatitude,
		PickupLongitude:  req.PickupLongitude,
		DropoffLatitude:  req.DropoffLatitude,
		DropoffLongitude: req.DropoffLongitude,
		Status:           "pending",
		CreatedAt:        time.Now(),
		ExpiresAt:        time.Now().Add(5 * time.Minute),
	}

	if err := s.rideRequestRepo.Create(ctx, rideRequest); err != nil {
		return nil, fmt.Errorf("failed to create ride request: %w", err)
	}

	// Publish trip created event
	s.eventBus.Publish(events.SubjectTripCreated, &events.TripCreatedEvent{
		TripID:           trip.ID.String(),
		UserID:           userID.String(),
		PickupLatitude:   req.PickupLatitude,
		PickupLongitude:  req.PickupLongitude,
		DropoffLatitude:  req.DropoffLatitude,
		DropoffLongitude: req.DropoffLongitude,
		EstimatedFare:    estimatedFare,
		CreatedAt:        trip.CreatedAt,
	})

	return trip, nil
}

func (s *TripService) GetTripByID(ctx context.Context, tripID uuid.UUID) (*domain.Trip, error) {
	trip, err := s.tripRepo.GetByID(ctx, tripID)
	if err != nil {
		return nil, errors.New("trip not found")
	}
	return trip, nil
}

func (s *TripService) GetUserTrips(ctx context.Context, userID uuid.UUID) ([]*domain.Trip, error) {
	return s.tripRepo.GetByUserID(ctx, userID)
}

func (s *TripService) GetActiveTrip(ctx context.Context, userID uuid.UUID) (*domain.Trip, error) {
	trip, err := s.tripRepo.GetActiveByUserID(ctx, userID)
	if err != nil {
		return nil, errors.New("no active trip found")
	}
	return trip, nil
}

func (s *TripService) CancelTrip(ctx context.Context, tripID, userID uuid.UUID) error {
	trip, err := s.tripRepo.GetByID(ctx, tripID)
	if err != nil {
		return errors.New("trip not found")
	}

	if trip.UserID != userID && (trip.DriverID == nil || *trip.DriverID != userID) {
		return errors.New("unauthorized to cancel this trip")
	}

	if trip.Status == domain.TripStatusCompleted || trip.Status == domain.TripStatusCancelled {
		return errors.New("cannot cancel completed or already cancelled trip")
	}

	if err := s.tripRepo.UpdateStatus(ctx, tripID, domain.TripStatusCancelled); err != nil {
		return fmt.Errorf("failed to cancel trip: %w", err)
	}

	// Publish trip cancelled event
	s.eventBus.Publish(events.SubjectTripCancelled, &events.TripCancelledEvent{
		TripID:       tripID.String(),
		UserID:       userID.String(),
		CancelledAt:  time.Now(),
		CancelReason: "User cancelled",
	})

	return nil
}

func (s *TripService) CompleteTrip(ctx context.Context, tripID uuid.UUID) error {
	trip, err := s.tripRepo.GetByID(ctx, tripID)
	if err != nil {
		return errors.New("trip not found")
	}

	if trip.Status != domain.TripStatusInProgress {
		return errors.New("only in-progress trips can be completed")
	}

	now := time.Now()
	if err := s.tripRepo.Complete(ctx, tripID, now); err != nil {
		return fmt.Errorf("failed to complete trip: %w", err)
	}

	// Publish trip completed event
	var driverID string
	if trip.DriverID != nil {
		driverID = trip.DriverID.String()
	}

	s.eventBus.Publish(events.SubjectTripCompleted, &events.TripCompletedEvent{
		TripID:      tripID.String(),
		UserID:      trip.UserID.String(),
		DriverID:    driverID,
		FinalFare:   trip.ActualFare,
		CompletedAt: now,
	})

	return nil
}

func (s *TripService) GetAvailableRideRequests(ctx context.Context) ([]*domain.RideRequest, error) {
	return s.rideRequestRepo.GetPending(ctx)
}

func (s *TripService) SubscribeToEvents() {
	// Subscribe to trip accepted event from driver service
	s.eventBus.Subscribe(events.SubjectTripAccepted, func(data []byte) {
		var event events.TripAcceptedEvent
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

		ctx := context.Background()
		if err := s.tripRepo.AssignDriver(ctx, tripID, driverID); err != nil {
			log.Printf("Failed to assign driver to trip: %v", err)
			return
		}

		log.Printf("Trip %s assigned to driver %s", event.TripID, event.DriverID)
	})

	// Subscribe to trip started event
	s.eventBus.Subscribe(events.SubjectTripStarted, func(data []byte) {
		var event events.TripStartedEvent
		if err := json.Unmarshal(data, &event); err != nil {
			log.Printf("Failed to unmarshal trip started event: %v", err)
			return
		}

		tripID, err := uuid.Parse(event.TripID)
		if err != nil {
			log.Printf("Invalid trip ID in event: %v", err)
			return
		}

		ctx := context.Background()
		if err := s.tripRepo.UpdateStatus(ctx, tripID, domain.TripStatusInProgress); err != nil {
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
