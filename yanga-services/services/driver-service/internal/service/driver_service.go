package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/namycodes/yanga-services/services/driver-service/internal/db"
	"github.com/namycodes/yanga-services/services/driver-service/internal/repository"
	"github.com/namycodes/yanga-services/shared-lib/domain"
	"github.com/namycodes/yanga-services/shared-lib/events"
)

type DriverService struct {
	repo     *repository.DriverRepository
	eventBus events.EventBus
}

func NewDriverService(repo *repository.DriverRepository, eventBus events.EventBus) *DriverService {
	return &DriverService{
		repo:     repo,
		eventBus: eventBus,
	}
}

func (s *DriverService) CreateDriverProfile(ctx context.Context, req *domain.CreateDriverProfileRequest) (*domain.DriverProfileResponse, error) {
	userUUID, err := uuid.Parse(req.UserID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	userID := pgtype.UUID{}
	copy(userID.Bytes[:], userUUID[:])
	userID.Valid = true

	profile, err := s.repo.CreateDriverProfile(ctx, db.CreateDriverProfileParams{
		UserID:             userID,
		LicenseNumber:      req.LicenseNumber,
		VehicleType:        req.VehicleType,
		VehicleModel:       req.VehicleModel,
		VehicleColor:       req.VehicleColor,
		VehiclePlateNumber: req.VehiclePlateNumber,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create driver profile: %w", err)
	}

	profileID, _ := uuid.FromBytes(profile.ID.Bytes[:])
	return &domain.DriverProfileResponse{
		ID:                 profileID.String(),
		UserID:             req.UserID,
		LicenseNumber:      profile.LicenseNumber,
		VehicleType:        profile.VehicleType,
		VehicleModel:       profile.VehicleModel,
		VehicleColor:       profile.VehicleColor,
		VehiclePlateNumber: profile.VehiclePlateNumber,
		IsOnline:           profile.IsOnline,
		IsApproved:         profile.IsApproved,
		Rating:             profile.Rating,
		TotalTrips:         profile.TotalTrips,
	}, nil
}

func (s *DriverService) GetDriverProfile(ctx context.Context, userID string) (*domain.DriverProfileResponse, error) {
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	userPgUUID := pgtype.UUID{}
	copy(userPgUUID.Bytes[:], userUUID[:])
	userPgUUID.Valid = true

	profile, err := s.repo.GetDriverProfileByUserID(ctx, userPgUUID)
	if err != nil {
		return nil, errors.New("driver profile not found")
	}

	profileID, _ := uuid.FromBytes(profile.ID.Bytes[:])
	return &domain.DriverProfileResponse{
		ID:                 profileID.String(),
		UserID:             userID,
		LicenseNumber:      profile.LicenseNumber,
		VehicleType:        profile.VehicleType,
		VehicleModel:       profile.VehicleModel,
		VehicleColor:       profile.VehicleColor,
		VehiclePlateNumber: profile.VehiclePlateNumber,
		IsOnline:           profile.IsOnline,
		IsApproved:         profile.IsApproved,
		Rating:             profile.Rating,
		TotalTrips:         profile.TotalTrips,
		CurrentLatitude:    profile.CurrentLatitude.Float64,
		CurrentLongitude:   profile.CurrentLongitude.Float64,
	}, nil
}

func (s *DriverService) UpdateDriverStatus(ctx context.Context, userID string, isOnline bool) error {
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user ID")
	}

	userPgUUID := pgtype.UUID{}
	copy(userPgUUID.Bytes[:], userUUID[:])
	userPgUUID.Valid = true

	err = s.repo.UpdateDriverStatus(ctx, db.UpdateDriverStatusParams{
		UserID:   userPgUUID,
		IsOnline: isOnline,
	})
	if err != nil {
		return fmt.Errorf("failed to update driver status: %w", err)
	}

	// Publish event
	subject := events.SubjectDriverOffline
	if isOnline {
		subject = events.SubjectDriverOnline
	}
	s.eventBus.Publish(subject, events.DriverStatusPayload{
		DriverID: userID,
		IsOnline: isOnline,
	})

	return nil
}

func (s *DriverService) UpdateDriverLocation(ctx context.Context, userID string, lat, lng float64) error {
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user ID")
	}

	userPgUUID := pgtype.UUID{}
	copy(userPgUUID.Bytes[:], userUUID[:])
	userPgUUID.Valid = true

	err = s.repo.UpdateDriverLocation(ctx, db.UpdateDriverLocationParams{
		UserID:           userPgUUID,
		CurrentLatitude:  pgtype.Float8{Float64: lat, Valid: true},
		CurrentLongitude: pgtype.Float8{Float64: lng, Valid: true},
	})
	if err != nil {
		return fmt.Errorf("failed to update driver location: %w", err)
	}

	// Publish location update event
	s.eventBus.Publish(events.SubjectDriverLocation, events.DriverLocationPayload{
		DriverID:  userID,
		Latitude:  lat,
		Longitude: lng,
	})

	return nil
}

func (s *DriverService) GetNearbyDrivers(ctx context.Context, lat, lng, radiusKm float64, limit int32) ([]domain.NearbyDriverResponse, error) {
	drivers, err := s.repo.GetNearbyDrivers(ctx, db.GetNearbyDriversParams{
		Column1: lat,
		Column2: lng,
		Column3: radiusKm,
		Column4: limit,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get nearby drivers: %w", err)
	}

	var response []domain.NearbyDriverResponse
	for _, driver := range drivers {
		driverID, _ := uuid.FromBytes(driver.ID.Bytes[:])
		userID, _ := uuid.FromBytes(driver.UserID.Bytes[:])

		response = append(response, domain.NearbyDriverResponse{
			DriverID:           driverID.String(),
			UserID:             userID.String(),
			FullName:           driver.FullName,
			PhoneNumber:        driver.PhoneNumber,
			VehicleType:        driver.VehicleType,
			VehicleModel:       driver.VehicleModel,
			VehicleColor:       driver.VehicleColor,
			VehiclePlateNumber: driver.VehiclePlateNumber,
			Rating:             driver.Rating,
			CurrentLatitude:    driver.CurrentLatitude.Float64,
			CurrentLongitude:   driver.CurrentLongitude.Float64,
			Distance:           driver.Distance.(float64),
		})
	}

	return response, nil
}
