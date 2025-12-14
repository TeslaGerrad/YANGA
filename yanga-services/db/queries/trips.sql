-- name: CreateTrip :one
INSERT INTO trips (
    user_id,
    pickup_latitude,
    pickup_longitude,
    pickup_address,
    dropoff_latitude,
    dropoff_longitude,
    dropoff_address,
    estimated_fare,
    estimated_duration,
    distance
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *;

-- name: GetTrip :one
SELECT * FROM trips
WHERE id = $1 LIMIT 1;

-- name: GetTripWithDetails :one
SELECT 
    t.*,
    u.full_name as user_name,
    u.phone_number as user_phone,
    u.profile_image_url as user_image,
    d.full_name as driver_name,
    d.phone_number as driver_phone,
    d.profile_image_url as driver_image
FROM trips t
JOIN users u ON t.user_id = u.id
LEFT JOIN users d ON t.driver_id = d.id
WHERE t.id = $1
LIMIT 1;

-- name: UpdateTripStatus :exec
UPDATE trips
SET status = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: AssignDriverToTrip :exec
UPDATE trips
SET driver_id = $2, status = 'accepted', updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: StartTrip :exec
UPDATE trips
SET 
    status = 'in_progress',
    started_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: CompleteTrip :exec
UPDATE trips
SET 
    status = 'completed',
    completed_at = CURRENT_TIMESTAMP,
    actual_fare = $2,
    actual_duration = $3,
    payment_status = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: CancelTrip :exec
UPDATE trips
SET 
    status = 'cancelled',
    cancelled_at = CURRENT_TIMESTAMP,
    cancellation_reason = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: GetUserTrips :many
SELECT * FROM trips
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: GetDriverTrips :many
SELECT * FROM trips
WHERE driver_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: GetPendingTrips :many
SELECT t.*, u.full_name, u.phone_number, u.profile_image_url
FROM trips t
JOIN users u ON t.user_id = u.id
WHERE t.status = 'pending'
ORDER BY t.created_at DESC
LIMIT $1 OFFSET $2;

-- name: GetActiveTrip :one
SELECT * FROM trips
WHERE user_id = $1 AND status IN ('pending', 'accepted', 'in_progress')
ORDER BY created_at DESC
LIMIT 1;

-- name: GetDriverActiveTrip :one
SELECT * FROM trips
WHERE driver_id = $1 AND status IN ('accepted', 'in_progress')
ORDER BY created_at DESC
LIMIT 1;
