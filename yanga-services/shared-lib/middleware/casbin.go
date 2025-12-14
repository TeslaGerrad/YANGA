package middleware

import (
	"log"
	"net/http"

	"github.com/casbin/casbin/v2"
)

func CasbinMiddleware(enforcer *casbin.Enforcer) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get user role from context
			role := r.Context().Value("role")
			if role == nil {
				role = "guest"
			}

			// Check permission
			allowed, err := enforcer.Enforce(role, r.URL.Path, r.Method)
			if err != nil {
				log.Printf("Casbin error: %v", err)
				http.Error(w, "Internal server error", http.StatusInternalServerError)
				return
			}

			if !allowed {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
