package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/namycodes/yanga-services/shared-lib/utils"
)

type contextKey string

const UserContextKey contextKey = "user"

func AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				utils.ErrorResponse(w, http.StatusUnauthorized, "Authorization header required")
				return
			}

			bearerToken := strings.Split(authHeader, " ")
			if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
				utils.ErrorResponse(w, http.StatusUnauthorized, "Invalid authorization header format")
				return
			}

			claims, err := utils.ValidateJWT(bearerToken[1], jwtSecret)
			if err != nil {
				utils.ErrorResponse(w, http.StatusUnauthorized, "Invalid or expired token")
				return
			}

			ctx := context.WithValue(r.Context(), "user_id", claims["user_id"])
			ctx = context.WithValue(ctx, "role", claims["role"])
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetUserID(ctx context.Context) string {
	userID, ok := ctx.Value("user_id").(string)
	if !ok {
		return ""
	}
	return userID
}

func GetUserRole(ctx context.Context) string {
	role, ok := ctx.Value("role").(string)
	if !ok {
		return ""
	}
	return role
}
