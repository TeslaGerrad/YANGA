package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/namycodes/yanga-services/services/auth-service/internal/db"
)

type AuthRepository struct {
	queries *db.Queries
}

func NewAuthRepository(queries *db.Queries) *AuthRepository {
	return &AuthRepository{
		queries: queries,
	}
}

func (r *AuthRepository) CreateUser(ctx context.Context, params db.CreateUserParams) (db.User, error) {
	return r.queries.CreateUser(ctx, params)
}

func (r *AuthRepository) GetUserByPhone(ctx context.Context, phone string) (db.User, error) {
	return r.queries.GetUserByPhone(ctx, phone)
}

func (r *AuthRepository) GetUserByEmail(ctx context.Context, email pgtype.Text) (db.User, error) {
	return r.queries.GetUserByEmail(ctx, email)
}

func (r *AuthRepository) GetUserByID(ctx context.Context, id pgtype.UUID) (db.User, error) {
	return r.queries.GetUserByID(ctx, id)
}

func (r *AuthRepository) UpdateUser(ctx context.Context, params db.UpdateUserParams) (db.User, error) {
	return r.queries.UpdateUser(ctx, params)
}

func (r *AuthRepository) SetResetToken(ctx context.Context, params db.SetResetTokenParams) error {
	return r.queries.SetResetToken(ctx, params)
}

func (r *AuthRepository) GetUserByResetToken(ctx context.Context, token pgtype.Text) (db.User, error) {
	return r.queries.GetUserByResetToken(ctx, token)
}

func (r *AuthRepository) UpdateUserPassword(ctx context.Context, params db.UpdateUserPasswordParams) error {
	return r.queries.UpdateUserPassword(ctx, params)
}

func (r *AuthRepository) ClearResetToken(ctx context.Context, id pgtype.UUID) error {
	return r.queries.ClearResetToken(ctx, id)
}
