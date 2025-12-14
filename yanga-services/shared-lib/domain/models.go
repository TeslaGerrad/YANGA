package domain

import (
	"time"

	"github.com/google/uuid"
)

// User represents a user in the system (rider or driver)
type User struct {
	ID              uuid.UUID `json:"id"`
	PhoneNumber     string    `json:"phone_number"`
	Email           *string   `json:"email,omitempty"`
	PasswordHash    string    `json:"-"`
	FullName        string    `json:"full_name"`
	Role            string    `json:"role"` // user, driver, admin
	ProfileImageURL *string   `json:"profile_image_url,omitempty"`
	IsVerified      bool      `json:"is_verified"`
	IsActive        bool      `json:"is_active"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// DriverProfile represents driver-specific information
type DriverProfile struct {
	ID                 uuid.UUID `json:"id"`
	UserID             uuid.UUID `json:"user_id"`
	LicenseNumber      string    `json:"license_number"`
	VehicleType        string    `json:"vehicle_type"`
	VehicleModel       string    `json:"vehicle_model"`
	VehicleColor       string    `json:"vehicle_color"`
	VehiclePlateNumber string    `json:"vehicle_plate_number"`
	IsOnline           bool      `json:"is_online"`
	IsApproved         bool      `json:"is_approved"`
	Rating             float64   `json:"rating"`
	TotalTrips         int       `json:"total_trips"`
	CurrentLatitude    *float64  `json:"current_latitude,omitempty"`
	CurrentLongitude   *float64  `json:"current_longitude,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// Trip represents a ride request/trip
type Trip struct {
	ID                 uuid.UUID  `json:"id"`
	UserID             uuid.UUID  `json:"user_id"`
	DriverID           *uuid.UUID `json:"driver_id,omitempty"`
	PickupLatitude     float64    `json:"pickup_latitude"`
	PickupLongitude    float64    `json:"pickup_longitude"`
	PickupAddress      string     `json:"pickup_address"`
	DropoffLatitude    float64    `json:"dropoff_latitude"`
	DropoffLongitude   float64    `json:"dropoff_longitude"`
	DropoffAddress     string     `json:"dropoff_address"`
	EstimatedFare      *float64   `json:"estimated_fare,omitempty"`
	ActualFare         *float64   `json:"actual_fare,omitempty"`
	EstimatedDuration  *int       `json:"estimated_duration,omitempty"`
	ActualDuration     *int       `json:"actual_duration,omitempty"`
	Distance           *float64   `json:"distance,omitempty"`
	Status             string     `json:"status"` // pending, accepted, in_progress, completed, cancelled
	PaymentStatus      *string    `json:"payment_status,omitempty"`
	PaymentMethod      *string    `json:"payment_method,omitempty"`
	StartedAt          *time.Time `json:"started_at,omitempty"`
	CompletedAt        *time.Time `json:"completed_at,omitempty"`
	CancelledAt        *time.Time `json:"cancelled_at,omitempty"`
	CancellationReason *string    `json:"cancellation_reason,omitempty"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

// Rating represents a rating given by one user to another
type Rating struct {
	ID        uuid.UUID `json:"id"`
	TripID    uuid.UUID `json:"trip_id"`
	RaterID   uuid.UUID `json:"rater_id"`
	RatedID   uuid.UUID `json:"rated_id"`
	Rating    int       `json:"rating"` // 1-5
	Feedback  *string   `json:"feedback,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// DTOs (Data Transfer Objects)

// AuthRequest represents authentication requests
type SignUpRequest struct {
	PhoneNumber string `json:"phone_number" validate:"required" example:"+254712345678"`
	Email       string `json:"email" validate:"omitempty,email" example:"user@example.com"`
	Password    string `json:"password" validate:"required,min=6" example:"password123"`
	FullName    string `json:"full_name" validate:"required" example:"John Doe"`
	Role        string `json:"role" validate:"required,oneof=user driver" example:"user"`
}

type SignInRequest struct {
	PhoneNumber string `json:"phone_number" validate:"required" example:"+254712345678"`
	Password    string `json:"password" validate:"required" example:"password123"`
}

type ForgotPasswordRequest struct {
	PhoneNumber string `json:"phone_number" validate:"required" example:"+254712345678"`
}

type ResetPasswordRequest struct {
	ResetToken  string `json:"reset_token" validate:"required" example:"abc123"`
	NewPassword string `json:"new_password" validate:"required,min=6" example:"newpassword123"`
}

type AuthResponse struct {
	Token string `json:"token" example:"eyJhbGciOiJIUzI1NiIs..."`
	User  User   `json:"user"`
}

// Trip DTOs
type CreateTripRequest struct {
	PickupLatitude   float64 `json:"pickup_latitude" validate:"required" example:"-1.286389"`
	PickupLongitude  float64 `json:"pickup_longitude" validate:"required" example:"36.817223"`
	PickupAddress    string  `json:"pickup_address" validate:"required" example:"Nairobi CBD"`
	DropoffLatitude  float64 `json:"dropoff_latitude" validate:"required" example:"-1.292066"`
	DropoffLongitude float64 `json:"dropoff_longitude" validate:"required" example:"36.821945"`
	DropoffAddress   string  `json:"dropoff_address" validate:"required" example:"Westlands"`
}

type TripResponse struct {
	Trip             Trip             `json:"trip"`
	AvailableDrivers []DriverWithInfo `json:"available_drivers,omitempty"`
}

type DriverWithInfo struct {
	DriverProfile DriverProfile `json:"driver_profile"`
	User          User          `json:"user"`
	Distance      *float64      `json:"distance,omitempty"`
}

// Driver DTOs
type UpdateDriverStatusRequest struct {
	IsOnline bool `json:"is_online" example:"true"`
}

type UpdateLocationRequest struct {
	Latitude  float64 `json:"latitude" validate:"required" example:"-1.286389"`
	Longitude float64 `json:"longitude" validate:"required" example:"36.817223"`
}

type AcceptTripRequest struct {
	TripID uuid.UUID `json:"trip_id" validate:"required"`
}

type CompleteTripRequest struct {
	ActualFare     float64 `json:"actual_fare" validate:"required" example:"450.00"`
	ActualDuration int     `json:"actual_duration" validate:"required" example:"25"`
	PaymentStatus  string  `json:"payment_status" validate:"required,oneof=paid pending failed" example:"paid"`
}

type CancelTripRequest struct {
	Reason string `json:"reason" validate:"required" example:"Changed my mind"`
}

type UpdateDriverProfileRequest struct {
	LicenseNumber      string `json:"license_number,omitempty" example:"DL123456789"`
	VehicleType        string `json:"vehicle_type,omitempty" example:"sedan"`
	VehicleModel       string `json:"vehicle_model,omitempty" example:"Toyota Corolla"`
	VehicleColor       string `json:"vehicle_color,omitempty" example:"White"`
	VehiclePlateNumber string `json:"vehicle_plate_number,omitempty" example:"KAA 123B"`
}

// Rating DTOs
type CreateRatingRequest struct {
	TripID   uuid.UUID `json:"trip_id" validate:"required"`
	RatedID  uuid.UUID `json:"rated_id" validate:"required"`
	Rating   int       `json:"rating" validate:"required,min=1,max=5" example:"5"`
	Feedback string    `json:"feedback" example:"Great driver!"`
}

// Response DTOs
type ErrorResponse struct {
	Error   string `json:"error" example:"Invalid request"`
	Message string `json:"message,omitempty" example:"Detailed error message"`
}

type SuccessResponse struct {
	Message string      `json:"message" example:"Operation successful"`
	Data    interface{} `json:"data,omitempty"`
}
