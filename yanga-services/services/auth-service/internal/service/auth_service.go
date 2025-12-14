package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/namycodes/yanga-services/services/auth-service/internal/db"
	"github.com/namycodes/yanga-services/services/auth-service/internal/repository"
	"github.com/namycodes/yanga-services/shared-lib/config"
	"github.com/namycodes/yanga-services/shared-lib/domain"
	"github.com/namycodes/yanga-services/shared-lib/events"
	"github.com/namycodes/yanga-services/shared-lib/utils"
)

type AuthService struct {
	repo     *repository.AuthRepository
	eventBus events.EventBus
	config   *config.Config
}

func NewAuthService(repo *repository.AuthRepository, eventBus events.EventBus, config *config.Config) *AuthService {
	return &AuthService{
		repo:     repo,
		eventBus: eventBus,
		config:   config,
	}
}

func (s *AuthService) Register(ctx context.Context, req *domain.RegisterRequest) (*domain.AuthResponse, error) {
	// Check if user already exists
	_, err := s.repo.GetUserByPhone(ctx, req.PhoneNumber)
	if err == nil {
		return nil, errors.New("phone number already registered")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user, err := s.repo.CreateUser(ctx, db.CreateUserParams{
		PhoneNumber:  req.PhoneNumber,
		Email:        pgtype.Text{String: req.Email, Valid: req.Email != ""},
		PasswordHash: hashedPassword,
		FullName:     req.FullName,
		Role:         req.Role,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Generate tokens
	accessToken, err := utils.GenerateToken(user.ID.Bytes[:], user.Role, s.config.JWTSecret, time.Duration(s.config.JWTExpiryHours)*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := utils.GenerateToken(user.ID.Bytes[:], user.Role, s.config.JWTSecret, 7*24*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Publish user created event
	userID, _ := uuid.FromBytes(user.ID.Bytes[:])
	s.eventBus.Publish(events.SubjectUserCreated, events.UserCreatedPayload{
		UserID:      userID.String(),
		PhoneNumber: user.PhoneNumber,
		Role:        user.Role,
		CreatedAt:   user.CreatedAt.Time,
	})

	return &domain.AuthResponse{
		User: domain.UserResponse{
			ID:          userID.String(),
			PhoneNumber: user.PhoneNumber,
			Email:       user.Email.String,
			FullName:    user.FullName,
			Role:        user.Role,
			IsVerified:  user.IsVerified,
			IsActive:    user.IsActive,
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) Login(ctx context.Context, req *domain.LoginRequest) (*domain.AuthResponse, error) {
	// Get user by phone
	user, err := s.repo.GetUserByPhone(ctx, req.PhoneNumber)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Verify password
	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid credentials")
	}

	// Check if user is active
	if !user.IsActive {
		return nil, errors.New("account is inactive")
	}

	// Generate tokens
	accessToken, err := utils.GenerateToken(user.ID.Bytes[:], user.Role, s.config.JWTSecret, time.Duration(s.config.JWTExpiryHours)*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := utils.GenerateToken(user.ID.Bytes[:], user.Role, s.config.JWTSecret, 7*24*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	userID, _ := uuid.FromBytes(user.ID.Bytes[:])
	return &domain.AuthResponse{
		User: domain.UserResponse{
			ID:          userID.String(),
			PhoneNumber: user.PhoneNumber,
			Email:       user.Email.String,
			FullName:    user.FullName,
			Role:        user.Role,
			IsVerified:  user.IsVerified,
			IsActive:    user.IsActive,
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) VerifyPhone(ctx context.Context, req *domain.VerifyPhoneRequest) error {
	// Get user by phone
	user, err := s.repo.GetUserByPhone(ctx, req.PhoneNumber)
	if err != nil {
		return errors.New("user not found")
	}

	// TODO: Verify OTP code with Twilio or Redis
	// For now, just mark as verified
	_, err = s.repo.UpdateUser(ctx, db.UpdateUserParams{
		ID:         user.ID,
		IsVerified: pgtype.Bool{Bool: true, Valid: true},
	})
	if err != nil {
		return fmt.Errorf("failed to verify phone: %w", err)
	}

	return nil
}

func (s *AuthService) ResendOTP(ctx context.Context, req *domain.ResendOTPRequest) error {
	// Get user by phone
	_, err := s.repo.GetUserByPhone(ctx, req.PhoneNumber)
	if err != nil {
		return errors.New("user not found")
	}

	// TODO: Send OTP via Twilio
	return nil
}

func (s *AuthService) ForgotPassword(ctx context.Context, req *domain.ForgotPasswordRequest) error {
	// Get user by phone
	user, err := s.repo.GetUserByPhone(ctx, req.PhoneNumber)
	if err != nil {
		return errors.New("user not found")
	}

	// Generate reset token
	resetToken := uuid.New().String()
	expiry := time.Now().Add(15 * time.Minute)

	err = s.repo.SetResetToken(ctx, db.SetResetTokenParams{
		ID:               user.ID,
		ResetToken:       pgtype.Text{String: resetToken, Valid: true},
		ResetTokenExpiry: pgtype.Timestamp{Time: expiry, Valid: true},
	})
	if err != nil {
		return fmt.Errorf("failed to set reset token: %w", err)
	}

	// TODO: Send reset token via SMS
	return nil
}

func (s *AuthService) ResetPassword(ctx context.Context, req *domain.ResetPasswordRequest) error {
	// Get user by reset token
	user, err := s.repo.GetUserByResetToken(ctx, pgtype.Text{String: req.ResetToken, Valid: true})
	if err != nil {
		return errors.New("invalid or expired reset token")
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password
	err = s.repo.UpdateUserPassword(ctx, db.UpdateUserPasswordParams{
		ID:           user.ID,
		PasswordHash: hashedPassword,
	})
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Clear reset token
	err = s.repo.ClearResetToken(ctx, user.ID)
	if err != nil {
		return fmt.Errorf("failed to clear reset token: %w", err)
	}

	return nil
}

func (s *AuthService) RefreshToken(ctx context.Context, req *domain.RefreshTokenRequest) (*domain.TokenResponse, error) {
	// Validate refresh token
	claims, err := utils.ValidateToken(req.RefreshToken, s.config.JWTSecret)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Get user to verify still active
	userID := pgtype.UUID{}
	copy(userID.Bytes[:], claims.UserID)
	userID.Valid = true

	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if !user.IsActive {
		return nil, errors.New("account is inactive")
	}

	// Generate new access token
	accessToken, err := utils.GenerateToken(user.ID.Bytes[:], user.Role, s.config.JWTSecret, time.Duration(s.config.JWTExpiryHours)*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	return &domain.TokenResponse{
		AccessToken: accessToken,
	}, nil
}
