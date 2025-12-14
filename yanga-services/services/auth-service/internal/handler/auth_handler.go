package handler

import (
	"encoding/json"
	"net/http"

	"github.com/namycodes/yanga-services/services/auth-service/internal/service"
	"github.com/namycodes/yanga-services/shared-lib/domain"
	"github.com/namycodes/yanga-services/shared-lib/utils"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register godoc
// @Summary Register a new user
// @Description Register a new user with phone number and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body domain.RegisterRequest true "Registration request"
// @Success 201 {object} domain.AuthResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 409 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /auth/register [post]
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req domain.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	response, err := h.authService.Register(r.Context(), &req)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "User registered successfully", response)
}

// Login godoc
// @Summary User login
// @Description Authenticate user with phone number and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body domain.LoginRequest true "Login request"
// @Success 200 {object} domain.AuthResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /auth/login [post]
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req domain.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	response, err := h.authService.Login(r.Context(), &req)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Login successful", response)
}

// VerifyPhone godoc
// @Summary Verify phone number with OTP
// @Description Verify user's phone number using OTP code
// @Tags auth
// @Accept json
// @Produce json
// @Param request body domain.VerifyPhoneRequest true "Verification request"
// @Success 200 {object} domain.MessageResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /auth/verify-phone [post]
func (h *AuthHandler) VerifyPhone(w http.ResponseWriter, r *http.Request) {
	var req domain.VerifyPhoneRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	err := h.authService.VerifyPhone(r.Context(), &req)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Phone verified successfully", nil)
}

// ResendOTP godoc
// @Summary Resend OTP code
// @Description Resend OTP code to user's phone number
// @Tags auth
// @Accept json
// @Produce json
// @Param request body domain.ResendOTPRequest true "Resend OTP request"
// @Success 200 {object} domain.MessageResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /auth/resend-otp [post]
func (h *AuthHandler) ResendOTP(w http.ResponseWriter, r *http.Request) {
	var req domain.ResendOTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	err := h.authService.ResendOTP(r.Context(), &req)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "OTP sent successfully", nil)
}

// ForgotPassword godoc
// @Summary Request password reset
// @Description Request password reset OTP for phone number
// @Tags auth
// @Accept json
// @Produce json
// @Param request body domain.ForgotPasswordRequest true "Forgot password request"
// @Success 200 {object} domain.MessageResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /auth/forgot-password [post]
func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req domain.ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	err := h.authService.ForgotPassword(r.Context(), &req)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Password reset OTP sent", nil)
}

// ResetPassword godoc
// @Summary Reset password
// @Description Reset user password with OTP verification
// @Tags auth
// @Accept json
// @Produce json
// @Param request body domain.ResetPasswordRequest true "Reset password request"
// @Success 200 {object} domain.MessageResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /auth/reset-password [post]
func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req domain.ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	err := h.authService.ResetPassword(r.Context(), &req)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Password reset successful", nil)
}

// RefreshToken godoc
// @Summary Refresh access token
// @Description Get new access token using refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body domain.RefreshTokenRequest true "Refresh token request"
// @Success 200 {object} domain.TokenResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /auth/refresh-token [post]
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req domain.RefreshTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	response, err := h.authService.RefreshToken(r.Context(), &req)
	if err != nil {
		utils.HandleServiceError(w, err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Token refreshed successfully", response)
}
