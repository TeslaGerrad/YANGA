package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/namycodes/yanga-services/shared-lib/domain"
)

type RideRequestRepository struct {
	db *pgxpool.Pool
}

func NewRideRequestRepository(db *pgxpool.Pool) *RideRequestRepository {
	return &RideRequestRepository{
		db: db,
	}
}

func (r *RideRequestRepository) Create(ctx context.Context, rideRequest *domain.RideRequest) error {
	query := `
		INSERT INTO ride_requests (id, trip_id, user_id, pickup_latitude, pickup_longitude,
			dropoff_latitude, dropoff_longitude, status, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.Exec(ctx, query,
		rideRequest.ID, rideRequest.TripID, rideRequest.UserID,
		rideRequest.PickupLatitude, rideRequest.PickupLongitude,
		rideRequest.DropoffLatitude, rideRequest.DropoffLongitude,
		rideRequest.Status, rideRequest.CreatedAt, rideRequest.ExpiresAt,
	)
	return err
}

func (r *RideRequestRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.RideRequest, error) {
	query := `
		SELECT id, trip_id, user_id, driver_id, pickup_latitude, pickup_longitude,
			dropoff_latitude, dropoff_longitude, status, created_at, expires_at, accepted_at
		FROM ride_requests WHERE id = $1
	`
	var req domain.RideRequest
	err := r.db.QueryRow(ctx, query, id).Scan(
		&req.ID, &req.TripID, &req.UserID, &req.DriverID,
		&req.PickupLatitude, &req.PickupLongitude,
		&req.DropoffLatitude, &req.DropoffLongitude,
		&req.Status, &req.CreatedAt, &req.ExpiresAt, &req.AcceptedAt,
	)
	if err != nil {
		return nil, err
	}
	return &req, nil
}

func (r *RideRequestRepository) GetPending(ctx context.Context) ([]*domain.RideRequest, error) {
	query := `
		SELECT id, trip_id, user_id, driver_id, pickup_latitude, pickup_longitude,
			dropoff_latitude, dropoff_longitude, status, created_at, expires_at, accepted_at
		FROM ride_requests 
		WHERE status = 'pending' AND expires_at > $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query, time.Now())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*domain.RideRequest
	for rows.Next() {
		var req domain.RideRequest
		if err := rows.Scan(
			&req.ID, &req.TripID, &req.UserID, &req.DriverID,
			&req.PickupLatitude, &req.PickupLongitude,
			&req.DropoffLatitude, &req.DropoffLongitude,
			&req.Status, &req.CreatedAt, &req.ExpiresAt, &req.AcceptedAt,
		); err != nil {
			return nil, err
		}
		requests = append(requests, &req)
	}
	return requests, nil
}

func (r *RideRequestRepository) Accept(ctx context.Context, id, driverID uuid.UUID) error {
	query := `
		UPDATE ride_requests 
		SET driver_id = $1, status = 'accepted', accepted_at = $2
		WHERE id = $3 AND status = 'pending'
	`
	_, err := r.db.Exec(ctx, query, driverID, time.Now(), id)
	return err
}
