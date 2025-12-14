package middleware
package middleware

import (
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/namycodes/yanga-services/shared-lib/utils"
)

func CasbinMiddleware(enforcer *casbin.Enforcer) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims := GetUserClaims(r.Context())
			if claims == nil {
				utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}
















}	}		})			next.ServeHTTP(w, r)			}				return				utils.RespondWithError(w, http.StatusForbidden, "Access denied")			if !allowed {			}				return				utils.RespondWithError(w, http.StatusInternalServerError, "Authorization check failed")			if err != nil {			allowed, err := enforcer.Enforce(claims.Role, r.URL.Path, r.Method)