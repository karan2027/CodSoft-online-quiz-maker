const express = require("express");
const router = express.Router();

// Import Auth Controllers
const {
  register,
  sendRegisterOTP,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  logout,
  getCurrentUser,
} = require("../controllers/authController");

// Import Auth Validators
const {
  registerValidator,
  registerOTPValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOTPValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

// Import Auth Middleware for protected routes
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerValidator, register);

/**
 * @route   POST /api/auth/register-otp
 * @desc    Send OTP to email for registration verification
 * @access  Public
 */
router.post("/register-otp", registerOTPValidator, sendRegisterOTP);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post("/login", loginValidator, login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP to user's email for password reset
 * @access  Public
 */
router.post("/forgot-password", forgotPasswordValidator, forgotPassword);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify the OTP sent to the user's email
 * @access  Public
 */
router.post("/verify-otp", verifyOTPValidator, verifyOTP);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password after OTP verification
 * @access  Public
 */
router.post("/reset-password", resetPasswordValidator, resetPassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear refresh token
 * @access  Private (Requires Authentication)
 */
router.post("/logout", authMiddleware, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged-in user profile
 * @access  Private (Requires Authentication)
 */
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;