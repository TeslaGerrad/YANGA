-- name: CreateRideRequest :one
INSERT INTO ride_requests (
    trip_id,
    driver_id,
    expires_at
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: GetRideRequest :one
SELECT * FROM ride_requests
WHERE id = $1 LIMIT 1;

-- name: GetDriverRideRequests :many
SELECT rr.*, t.*, u.full_name, u.phone_number, u.profile_image_url
FROM ride_requests rr
JOIN trips t ON rr.trip_id = t.id
JOIN users u ON t.user_id = u.id
WHERE rr.driver_id = $1 AND rr.status = 'pending' AND rr.expires_at > CURRENT_TIMESTAMP
ORDER BY rr.created_at DESC;

-- name: UpdateRideRequestStatus :exec
UPDATE ride_requests
SET status = $2, responded_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: ExpireOldRequests :exec
UPDATE ride_requests
SET status = 'expired'
WHERE status = 'pending' AND expires_at <= CURRENT_TIMESTAMP;

-- name: GetRideRequestByTripAndDriver :one
SELECT * FROM ride_requests
WHERE trip_id = $1 AND driver_id = $2
LIMIT 1;
