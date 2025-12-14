package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/namycodes/yanga-services/shared-lib/config"
	"github.com/namycodes/yanga-services/shared-lib/utils"
)

type contextKey string

const UserContextKey contextKey = "user"

func AuthMiddleware(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				utils.RespondWithError(w, http.StatusUnauthorized, "Authorization header required")
				return
			}

			bearerToken := strings.Split(authHeader, " ")
			if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
				utils.RespondWithError(w, http.StatusUnauthorized, "Invalid authorization header format")
				return
			}

			claims, err := utils.ValidateJWT(bearerToken[1], cfg.JWT.Secret)
			if err != nil {
				utils.RespondWithError(w, http.StatusUnauthorized, "Invalid or expired token")
				return
			}

			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetUserClaims(ctx context.Context) *utils.JWTClaims {
	claims, ok := ctx.Value(UserContextKey).(*utils.JWTClaims)
	if !ok {
		return nil
	}
	return claims
}
