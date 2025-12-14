package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/namycodes/yanga-services/shared-lib/domain"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (id, phone_number, password_hash, first_name, last_name, email, role, is_verified, otp, otp_expiry, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`
	_, err := r.db.Exec(ctx, query,
		user.ID,
		user.PhoneNumber,
		user.PasswordHash,
		user.FirstName,
		user.LastName,
		user.Email,
		user.Role,
		user.IsVerified,
		user.OTP,
		user.OTPExpiry,
		user.CreatedAt,
		user.UpdatedAt,
	)
	return err
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	query := `
		SELECT id, phone_number, password_hash, first_name, last_name, email, role, is_verified, otp, otp_expiry, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	var user domain.User
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.PhoneNumber,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.Role,
		&user.IsVerified,
		&user.OTP,
		&user.OTPExpiry,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByPhoneNumber(ctx context.Context, phoneNumber string) (*domain.User, error) {
	query := `
		SELECT id, phone_number, password_hash, first_name, last_name, email, role, is_verified, otp, otp_expiry, created_at, updated_at
		FROM users
		WHERE phone_number = $1
	`
	var user domain.User
	err := r.db.QueryRow(ctx, query, phoneNumber).Scan(
		&user.ID,
		&user.PhoneNumber,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.Role,
		&user.IsVerified,
		&user.OTP,
		&user.OTPExpiry,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Update(ctx context.Context, user *domain.User) error {
	query := `
		UPDATE users
		SET first_name = $1, last_name = $2, email = $3, updated_at = $4
		WHERE id = $5
	`
	_, err := r.db.Exec(ctx, query,
		user.FirstName,
		user.LastName,
		user.Email,
		time.Now(),
		user.ID,
	)
	return err
}

func (r *UserRepository) UpdatePassword(ctx context.Context, id uuid.UUID, passwordHash string) error {
	query := `
		UPDATE users
		SET password_hash = $1, otp = NULL, otp_expiry = NULL, updated_at = $2
		WHERE id = $3
	`
	_, err := r.db.Exec(ctx, query, passwordHash, time.Now(), id)
	return err
}

func (r *UserRepository) UpdateOTP(ctx context.Context, id uuid.UUID, otp string, otpExpiry time.Time) error {
	query := `
		UPDATE users
		SET otp = $1, otp_expiry = $2, updated_at = $3
		WHERE id = $4
	`
	_, err := r.db.Exec(ctx, query, otp, otpExpiry, time.Now(), id)
	return err
}

func (r *UserRepository) VerifyPhone(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE users
		SET is_verified = true, otp = NULL, otp_expiry = NULL, updated_at = $1
		WHERE id = $2
	`
	_, err := r.db.Exec(ctx, query, time.Now(), id)
	return err
}

func (r *UserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
