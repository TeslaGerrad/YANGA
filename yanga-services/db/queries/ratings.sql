-- name: CreateRating :one
INSERT INTO ratings (
    trip_id,
    rater_id,
    rated_id,
    rating,
    feedback
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: GetRating :one
SELECT * FROM ratings
WHERE id = $1 LIMIT 1;

-- name: GetRatingByTripAndRater :one
SELECT * FROM ratings
WHERE trip_id = $1 AND rater_id = $2
LIMIT 1;

-- name: GetUserRatings :many
SELECT r.*, u.full_name as rater_name
FROM ratings r
JOIN users u ON r.rater_id = u.id
WHERE r.rated_id = $1
ORDER BY r.created_at DESC
LIMIT $2 OFFSET $3;

-- name: GetAverageRating :one
SELECT 
    COALESCE(AVG(rating), 0) as average_rating,
    COUNT(*) as total_ratings
FROM ratings
WHERE rated_id = $1;

-- name: UpdateRating :one
UPDATE ratings
SET rating = $2, feedback = $3
WHERE id = $1
RETURNING *;

-- name: DeleteRating :exec
DELETE FROM ratings WHERE id = $1;
