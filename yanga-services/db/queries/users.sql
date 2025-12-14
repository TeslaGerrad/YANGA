-- name: CreateUser :one
INSERT INTO users (
    phone_number,
    email,
    password_hash,
    full_name,
    role
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: GetUserByPhone :one
SELECT * FROM users
WHERE phone_number = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;

-- name: UpdateUser :one
UPDATE users
SET
    email = COALESCE(sqlc.narg('email'), email),
    full_name = COALESCE(sqlc.narg('full_name'), full_name),
    profile_image_url = COALESCE(sqlc.narg('profile_image_url'), profile_image_url),
    is_verified = COALESCE(sqlc.narg('is_verified'), is_verified),
    is_active = COALESCE(sqlc.narg('is_active'), is_active),
    updated_at = CURRENT_TIMESTAMP
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: UpdateUserPassword :exec
UPDATE users
SET password_hash = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: SetResetToken :exec
UPDATE users
SET reset_token = $2, reset_token_expiry = $3, updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: GetUserByResetToken :one
SELECT * FROM users
WHERE reset_token = $1 AND reset_token_expiry > CURRENT_TIMESTAMP
LIMIT 1;

-- name: ClearResetToken :exec
UPDATE users
SET reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;

-- name: ListUsers :many
SELECT * FROM users
WHERE role = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
