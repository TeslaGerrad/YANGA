package middleware
package middleware

import (
	"net/http"
)
















}	})		next.ServeHTTP(w, r)		}			return			w.WriteHeader(http.StatusOK)		if r.Method == "OPTIONS" {		w.Header().Set("Access-Control-Max-Age", "3600")		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")		w.Header().Set("Access-Control-Allow-Origin", "*")	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {func CORSMiddleware(next http.Handler) http.Handler {