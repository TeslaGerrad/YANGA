package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/namycodes/yanga-services/services/rating-service/internal/db"
	"github.com/namycodes/yanga-services/services/rating-service/internal/repository"
	"github.com/namycodes/yanga-services/shared-lib/domain"
	"github.com/namycodes/yanga-services/shared-lib/events"
)

type RatingService struct {
	repo     *repository.RatingRepository
	eventBus events.EventBus
}

func NewRatingService(repo *repository.RatingRepository, eventBus events.EventBus) *RatingService {
	return &RatingService{
		repo:     repo,
		eventBus: eventBus,
	}
}

func (s *RatingService) CreateRating(ctx context.Context, req *domain.CreateRatingRequest) (*domain.RatingResponse, error) {
	tripUUID, err := uuid.Parse(req.TripID)
	if err != nil {
		return nil, errors.New("invalid trip ID")
	}

	raterUUID, err := uuid.Parse(req.RaterID)
	if err != nil {
		return nil, errors.New("invalid rater ID")
	}

	ratedUUID, err := uuid.Parse(req.RatedID)
	if err != nil {
		return nil, errors.New("invalid rated ID")
	}

	tripID := pgtype.UUID{}
	copy(tripID.Bytes[:], tripUUID[:])
	tripID.Valid = true

	raterID := pgtype.UUID{}
	copy(raterID.Bytes[:], raterUUID[:])
	raterID.Valid = true

	ratedID := pgtype.UUID{}
	copy(ratedID.Bytes[:], ratedUUID[:])
	ratedID.Valid = true

	rating, err := s.repo.CreateRating(ctx, db.CreateRatingParams{
		TripID:    tripID,
		RaterID:   raterID,
		RatedID:   ratedID,
		RaterType: req.RaterType,
		Rating:    req.Rating,
		Comment:   pgtype.Text{String: req.Comment, Valid: req.Comment != ""},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create rating: %w", err)
	}

	// Publish rating created event
	ratingID, _ := uuid.FromBytes(rating.ID.Bytes[:])
	s.eventBus.Publish(events.SubjectRatingCreated, events.RatingCreatedPayload{
		RatingID:  ratingID.String(),
		TripID:    req.TripID,
		RatedID:   req.RatedID,
		RaterType: req.RaterType,
		Rating:    req.Rating,
	})

	return &domain.RatingResponse{
		ID:        ratingID.String(),
		TripID:    req.TripID,
		RaterID:   req.RaterID,
		RatedID:   req.RatedID,
		RaterType: rating.RaterType,
		Rating:    rating.Rating,
		Comment:   rating.Comment.String,
		CreatedAt: rating.CreatedAt.Time,
	}, nil
}

func (s *RatingService) GetTripRating(ctx context.Context, tripID string) (*domain.RatingResponse, error) {
	tripUUID, err := uuid.Parse(tripID)
	if err != nil {
		return nil, errors.New("invalid trip ID")
	}

	tripPgUUID := pgtype.UUID{}
	copy(tripPgUUID.Bytes[:], tripUUID[:])
	tripPgUUID.Valid = true

	rating, err := s.repo.GetTripRating(ctx, tripPgUUID)
	if err != nil {
		return nil, errors.New("rating not found")
	}

	ratingID, _ := uuid.FromBytes(rating.ID.Bytes[:])
	raterID, _ := uuid.FromBytes(rating.RaterID.Bytes[:])
	ratedID, _ := uuid.FromBytes(rating.RatedID.Bytes[:])

	return &domain.RatingResponse{
		ID:        ratingID.String(),
		TripID:    tripID,
		RaterID:   raterID.String(),
		RatedID:   ratedID.String(),
		RaterType: rating.RaterType,
		Rating:    rating.Rating,
		Comment:   rating.Comment.String,
		CreatedAt: rating.CreatedAt.Time,
	}, nil
}

func (s *RatingService) GetDriverRatings(ctx context.Context, driverID string, limit, offset int32) ([]domain.RatingResponse, error) {
	driverUUID, err := uuid.Parse(driverID)
	if err != nil {
		return nil, errors.New("invalid driver ID")
	}

	driverPgUUID := pgtype.UUID{}
	copy(driverPgUUID.Bytes[:], driverUUID[:])
	driverPgUUID.Valid = true

	ratings, err := s.repo.GetDriverRatings(ctx, db.GetDriverRatingsParams{
		RatedID: driverPgUUID,
		Limit:   limit,
		Offset:  offset,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get driver ratings: %w", err)
	}

	var response []domain.RatingResponse
	for _, rating := range ratings {
		ratingID, _ := uuid.FromBytes(rating.ID.Bytes[:])
		tripID, _ := uuid.FromBytes(rating.TripID.Bytes[:])
		raterID, _ := uuid.FromBytes(rating.RaterID.Bytes[:])
		ratedID, _ := uuid.FromBytes(rating.RatedID.Bytes[:])

		response = append(response, domain.RatingResponse{
			ID:        ratingID.String(),
			TripID:    tripID.String(),
			RaterID:   raterID.String(),
			RatedID:   ratedID.String(),
			RaterType: rating.RaterType,
			Rating:    rating.Rating,
			Comment:   rating.Comment.String,
			CreatedAt: rating.CreatedAt.Time,
		})
	}

	return response, nil
}

func (s *RatingService) GetAverageDriverRating(ctx context.Context, driverID string) (float64, error) {
	driverUUID, err := uuid.Parse(driverID)
	if err != nil {
		return 0, errors.New("invalid driver ID")
	}

	driverPgUUID := pgtype.UUID{}
	copy(driverPgUUID.Bytes[:], driverUUID[:])
	driverPgUUID.Valid = true

	avgRating, err := s.repo.GetAverageDriverRating(ctx, driverPgUUID)
	if err != nil {
		return 0, fmt.Errorf("failed to get average rating: %w", err)
	}

	// Convert string to float64
	var rating float64
	fmt.Sscanf(avgRating, "%f", &rating)
	return rating, nil
}
