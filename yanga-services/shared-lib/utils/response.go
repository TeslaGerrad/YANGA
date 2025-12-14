package utils

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/namycodes/yanga-services/shared-lib/domain"
)

func RespondWithJSON(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(payload)
}

func RespondWithError(w http.ResponseWriter, statusCode int, errorMsg string) {
	RespondWithJSON(w, statusCode, domain.ErrorResponse{
		Error: errorMsg,
	})
}

func RespondWithSuccess(w http.ResponseWriter, statusCode int, message string, data interface{}) {
	RespondWithJSON(w, statusCode, domain.SuccessResponse{
		Message: message,
		Data:    data,
	})
}

func ErrorResponse(w http.ResponseWriter, statusCode int, errorMsg string) {
	RespondWithError(w, statusCode, errorMsg)
}

func SuccessResponse(w http.ResponseWriter, statusCode int, message string, data interface{}) {
	RespondWithSuccess(w, statusCode, message, data)
}

func HandleServiceError(w http.ResponseWriter, err error) {
	if err.Error() == "not found" || err.Error() == "user not found" || err.Error() == "trip not found" {
		ErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}

	if err.Error() == "unauthorized" || err.Error() == "invalid credentials" {
		ErrorResponse(w, http.StatusUnauthorized, err.Error())
		return
	}

	ErrorResponse(w, http.StatusInternalServerError, "Internal server error")
}

func GetUserIDFromContext(ctx context.Context) (uuid.UUID, error) {
	userID, ok := ctx.Value("user_id").(string)
	if !ok {
		return uuid.Nil, errors.New("user ID not found in context")
	}
	return uuid.Parse(userID)
}

func GetRoleFromContext(ctx context.Context) (string, error) {
	role, ok := ctx.Value("role").(string)
	if !ok {
		return "", errors.New("role not found in context")
	}
	return role, nil
}
