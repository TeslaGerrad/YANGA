package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/namycodes/yanga-services/services/trip-service/internal/db"
)

type TripRepository struct {
	queries *db.Queries
}

func NewTripRepository(queries *db.Queries) *TripRepository {
	return &TripRepository{
		queries: queries,
	}
}

func (r *TripRepository) CreateTrip(ctx context.Context, params db.CreateTripParams) (db.Trip, error) {
	return r.queries.CreateTrip(ctx, params)
}

func (r *TripRepository) GetTripByID(ctx context.Context, id pgtype.UUID) (db.Trip, error) {
	return r.queries.GetTripByID(ctx, id)
}

func (r *TripRepository) GetUserTrips(ctx context.Context, params db.GetUserTripsParams) ([]db.Trip, error) {
	return r.queries.GetUserTrips(ctx, params)
}

func (r *TripRepository) GetDriverTrips(ctx context.Context, params db.GetDriverTripsParams) ([]db.Trip, error) {
	return r.queries.GetDriverTrips(ctx, params)
}

func (r *TripRepository) UpdateTripStatus(ctx context.Context, params db.UpdateTripStatusParams) (db.Trip, error) {
	return r.queries.UpdateTripStatus(ctx, params)
}

func (r *TripRepository) AssignDriverToTrip(ctx context.Context, params db.AssignDriverToTripParams) (db.Trip, error) {
	return r.queries.AssignDriverToTrip(ctx, params)
}

func (r *TripRepository) CompleteTrip(ctx context.Context, params db.CompleteTripParams) (db.Trip, error) {
	return r.queries.CompleteTrip(ctx, params)
}

func (r *TripRepository) CancelTrip(ctx context.Context, params db.CancelTripParams) (db.Trip, error) {
	return r.queries.CancelTrip(ctx, params)
}

func (r *TripRepository) GetActiveTripByUser(ctx context.Context, userID pgtype.UUID) (db.Trip, error) {
	return r.queries.GetActiveTripByUser(ctx, userID)
}

func (r *TripRepository) GetActiveTripByDriver(ctx context.Context, driverID pgtype.UUID) (db.Trip, error) {
	return r.queries.GetActiveTripByDriver(ctx, driverID)
}
