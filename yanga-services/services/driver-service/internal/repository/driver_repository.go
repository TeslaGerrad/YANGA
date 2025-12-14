package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/namycodes/yanga-services/services/driver-service/internal/db"
)

type DriverRepository struct {
	queries *db.Queries
}

func NewDriverRepository(queries *db.Queries) *DriverRepository {
	return &DriverRepository{
		queries: queries,
	}
}

func (r *DriverRepository) CreateDriverProfile(ctx context.Context, params db.CreateDriverProfileParams) (db.DriverProfile, error) {
	return r.queries.CreateDriverProfile(ctx, params)
}

func (r *DriverRepository) GetDriverProfile(ctx context.Context, id pgtype.UUID) (db.DriverProfile, error) {
	return r.queries.GetDriverProfile(ctx, id)
}

func (r *DriverRepository) GetDriverProfileByUserID(ctx context.Context, userID pgtype.UUID) (db.DriverProfile, error) {
	return r.queries.GetDriverProfileByUserID(ctx, userID)
}

func (r *DriverRepository) UpdateDriverStatus(ctx context.Context, params db.UpdateDriverStatusParams) error {
	return r.queries.UpdateDriverStatus(ctx, params)
}

func (r *DriverRepository) UpdateDriverLocation(ctx context.Context, params db.UpdateDriverLocationParams) error {
	return r.queries.UpdateDriverLocation(ctx, params)
}

func (r *DriverRepository) UpdateDriverProfile(ctx context.Context, params db.UpdateDriverProfileParams) (db.DriverProfile, error) {
	return r.queries.UpdateDriverProfile(ctx, params)
}

func (r *DriverRepository) UpdateDriverRating(ctx context.Context, params db.UpdateDriverRatingParams) error {
	return r.queries.UpdateDriverRating(ctx, params)
}

func (r *DriverRepository) GetOnlineDrivers(ctx context.Context, params db.GetOnlineDriversParams) ([]db.GetOnlineDriversRow, error) {
	return r.queries.GetOnlineDrivers(ctx, params)
}

func (r *DriverRepository) GetNearbyDrivers(ctx context.Context, params db.GetNearbyDriversParams) ([]db.GetNearbyDriversRow, error) {
	return r.queries.GetNearbyDrivers(ctx, params)
}

func (r *DriverRepository) GetDriverStats(ctx context.Context, userID pgtype.UUID) (db.GetDriverStatsRow, error) {
	return r.queries.GetDriverStats(ctx, userID)
}
