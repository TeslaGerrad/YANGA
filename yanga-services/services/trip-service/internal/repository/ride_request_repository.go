package repository

import (
	"github.com/namycodes/yanga-services/services/trip-service/internal/db"
)

type RideRequestRepository struct {
	queries *db.Queries
}

func NewRideRequestRepository(queries *db.Queries) *RideRequestRepository {
	return &RideRequestRepository{
		queries: queries,
	}
}

// TODO: Implement ride request methods when ride_requests table is added to schema
