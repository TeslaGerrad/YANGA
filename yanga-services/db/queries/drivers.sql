-- name: CreateDriverProfile :one
INSERT INTO driver_profiles (
    user_id,
    license_number,
    vehicle_type,
    vehicle_model,
    vehicle_color,
    vehicle_plate_number
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING *;

-- name: GetDriverProfile :one
SELECT * FROM driver_profiles
WHERE id = $1 LIMIT 1;

-- name: GetDriverProfileByUserID :one
SELECT * FROM driver_profiles
WHERE user_id = $1 LIMIT 1;

-- name: UpdateDriverStatus :exec
UPDATE driver_profiles
SET is_online = $2, updated_at = CURRENT_TIMESTAMP
WHERE user_id = $1;

-- name: UpdateDriverLocation :exec
UPDATE driver_profiles
SET 
    current_latitude = $2,
    current_longitude = $3,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = $1;

-- name: UpdateDriverProfile :one
UPDATE driver_profiles
SET
    license_number = COALESCE(sqlc.narg('license_number'), license_number),
    vehicle_type = COALESCE(sqlc.narg('vehicle_type'), vehicle_type),
    vehicle_model = COALESCE(sqlc.narg('vehicle_model'), vehicle_model),
    vehicle_color = COALESCE(sqlc.narg('vehicle_color'), vehicle_color),
    vehicle_plate_number = COALESCE(sqlc.narg('vehicle_plate_number'), vehicle_plate_number),
    is_approved = COALESCE(sqlc.narg('is_approved'), is_approved),
    updated_at = CURRENT_TIMESTAMP
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: UpdateDriverRating :exec
UPDATE driver_profiles
SET rating = $2, total_trips = $3, updated_at = CURRENT_TIMESTAMP
WHERE user_id = $1;

-- name: GetOnlineDrivers :many
SELECT dp.*, u.full_name, u.phone_number, u.profile_image_url
FROM driver_profiles dp
JOIN users u ON dp.user_id = u.id
WHERE dp.is_online = TRUE AND dp.is_approved = TRUE
ORDER BY dp.rating DESC
LIMIT $1 OFFSET $2;

-- name: GetNearbyDrivers :many
SELECT * FROM (
    SELECT dp.*, u.full_name, u.phone_number, u.profile_image_url,
        (6371 * acos(
            cos(radians($1)) * cos(radians(dp.current_latitude)) *
            cos(radians(dp.current_longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(dp.current_latitude))
        )) AS distance
    FROM driver_profiles dp
    JOIN users u ON dp.user_id = u.id
    WHERE dp.is_online = TRUE 
        AND dp.is_approved = TRUE
        AND dp.current_latitude IS NOT NULL
        AND dp.current_longitude IS NOT NULL
) AS nearby
WHERE distance < $3
ORDER BY distance
LIMIT $4;

-- name: GetDriverStats :one
SELECT 
    total_trips,
    rating
FROM driver_profiles
WHERE user_id = $1;
