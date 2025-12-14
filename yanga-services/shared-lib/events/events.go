package events

import (
	"encoding/json"
	"log"
	"time"

	"github.com/nats-io/nats.go"
)

// Event subjects
const (
	SubjectUserCreated    = "user.created"
	SubjectTripCreated    = "trip.created"
	SubjectTripAccepted   = "trip.accepted"
	SubjectTripStarted    = "trip.started"
	SubjectTripCompleted  = "trip.completed"
	SubjectTripCancelled  = "trip.cancelled"
	SubjectDriverOnline   = "driver.online"
	SubjectDriverOffline  = "driver.offline"
	SubjectDriverLocation = "driver.location"
	SubjectRatingCreated  = "rating.created"
)

type EventBus interface {
	Publish(subject string, data interface{}) error
	Subscribe(subject string, handler func([]byte)) (*nats.Subscription, error)
	QueueSubscribe(subject, queue string, handler func([]byte)) (*nats.Subscription, error)
	Close()
}

type NATSEventBus struct {
	conn *nats.Conn
}

func NewEventBus(natsURL string) (*NATSEventBus, error) {
	nc, err := nats.Connect(natsURL)
	if err != nil {
		return nil, err
	}

	log.Printf("Connected to NATS at %s", natsURL)
	return &NATSEventBus{conn: nc}, nil
}

func NewNATSEventBus(natsURL string) (EventBus, error) {
	nc, err := nats.Connect(natsURL)
	if err != nil {
		return nil, err
	}

	log.Printf("✅ Connected to NATS at %s", natsURL)
	return &NATSEventBus{conn: nc}, nil
}

func (eb *NATSEventBus) Publish(subject string, data interface{}) error {
	payload, err := json.Marshal(data)
	if err != nil {
		return err
	}

	return eb.conn.Publish(subject, payload)
}

func (eb *NATSEventBus) Subscribe(subject string, handler func([]byte)) (*nats.Subscription, error) {
	return eb.conn.Subscribe(subject, func(msg *nats.Msg) {
		handler(msg.Data)
	})
}

func (eb *NATSEventBus) QueueSubscribe(subject, queue string, handler func([]byte)) (*nats.Subscription, error) {
	return eb.conn.QueueSubscribe(subject, queue, func(msg *nats.Msg) {
		handler(msg.Data)
	})
}

func (eb *NATSEventBus) Close() {
	if eb.conn != nil {
		eb.conn.Close()
	}
}

// Event payloads
type UserCreatedEvent struct {
	UserID      string `json:"user_id"`
	PhoneNumber string `json:"phone_number"`
	FullName    string `json:"full_name"`
	Role        string `json:"role"`
}

type TripCreatedEvent struct {
	TripID           string    `json:"trip_id"`
	UserID           string    `json:"user_id"`
	PickupLatitude   float64   `json:"pickup_latitude"`
	PickupLongitude  float64   `json:"pickup_longitude"`
	DropoffLatitude  float64   `json:"dropoff_latitude"`
	DropoffLongitude float64   `json:"dropoff_longitude"`
	EstimatedFare    *float64  `json:"estimated_fare,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
}

type TripAcceptedEvent struct {
	TripID    string    `json:"trip_id"`
	DriverID  string    `json:"driver_id"`
	UserID    string    `json:"user_id"`
	Timestamp time.Time `json:"timestamp"`
}

type TripStartedEvent struct {
	TripID    string    `json:"trip_id"`
	DriverID  string    `json:"driver_id"`
	StartedAt time.Time `json:"started_at"`
	Timestamp time.Time `json:"timestamp"`
}

type TripCompletedEvent struct {
	TripID         string    `json:"trip_id"`
	DriverID       string    `json:"driver_id"`
	ActualFare     float64   `json:"actual_fare"`
	ActualDuration int       `json:"actual_duration"`
	PaymentStatus  string    `json:"payment_status"`
	CompletedAt    time.Time `json:"completed_at"`
	Timestamp      time.Time `json:"timestamp"`
}

type TripStatusEvent struct {
	TripID string `json:"trip_id"`
	Status string `json:"status"`
}

type DriverLocationEvent struct {
	DriverID  string    `json:"driver_id"`
	UserID    string    `json:"user_id"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	IsOnline  bool      `json:"is_online"`
	Timestamp time.Time `json:"timestamp"`
}

type DriverStatusEvent struct {
	DriverID  string    `json:"driver_id"`
	UserID    string    `json:"user_id"`
	IsOnline  bool      `json:"is_online"`
	Latitude  *float64  `json:"latitude,omitempty"`
	Longitude *float64  `json:"longitude,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

type RatingCreatedEvent struct {
	RatingID string `json:"rating_id"`
	TripID   string `json:"trip_id"`
	RatedID  string `json:"rated_id"`
	Rating   int    `json:"rating"`
}

// Additional payload types for compatibility
type UserCreatedPayload struct {
	UserID      string    `json:"user_id"`
	PhoneNumber string    `json:"phone_number"`
	Role        string    `json:"role"`
	CreatedAt   time.Time `json:"created_at"`
}

type DriverStatusPayload struct {
	DriverID string `json:"driver_id"`
	IsOnline bool   `json:"is_online"`
}

type DriverLocationPayload struct {
	DriverID  string  `json:"driver_id"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type RatingCreatedPayload struct {
	RatingID  string `json:"rating_id"`
	TripID    string `json:"trip_id"`
	RatedID   string `json:"rated_id"`
	RaterType string `json:"rater_type"`
	Rating    int32  `json:"rating"`
}
