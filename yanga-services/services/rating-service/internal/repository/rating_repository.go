package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/namycodes/yanga-services/services/rating-service/internal/db"
)

type RatingRepository struct {
	queries *db.Queries
}

func NewRatingRepository(queries *db.Queries) *RatingRepository {
	return &RatingRepository{
		queries: queries,
	}
}

func (r *RatingRepository) CreateRating(ctx context.Context, params db.CreateRatingParams) (db.Rating, error) {
	return r.queries.CreateRating(ctx, params)
}

func (r *RatingRepository) GetRatingByID(ctx context.Context, id pgtype.UUID) (db.Rating, error) {
	return r.queries.GetRatingByID(ctx, id)
}

func (r *RatingRepository) GetTripRating(ctx context.Context, tripID pgtype.UUID) (db.Rating, error) {
	return r.queries.GetTripRating(ctx, tripID)
}

func (r *RatingRepository) GetUserRatings(ctx context.Context, params db.GetUserRatingsParams) ([]db.Rating, error) {
	return r.queries.GetUserRatings(ctx, params)
}

func (r *RatingRepository) GetDriverRatings(ctx context.Context, params db.GetDriverRatingsParams) ([]db.Rating, error) {
	return r.queries.GetDriverRatings(ctx, params)
}

func (r *RatingRepository) GetAverageDriverRating(ctx context.Context, driverID pgtype.UUID) (string, error) {
	return r.queries.GetAverageDriverRating(ctx, driverID)
}

func (r *RatingRepository) GetAverageUserRating(ctx context.Context, userID pgtype.UUID) (string, error) {
	return r.queries.GetAverageUserRating(ctx, userID)
}
