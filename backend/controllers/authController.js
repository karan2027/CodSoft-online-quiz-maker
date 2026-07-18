const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Verification = require("../models/Verification");
const generateToken = require("../utils/generateToken");
const generateOTP = require("../utils/generateOTP");
const emailService = require("../services/emailService");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    // 1. Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { fullName, username, email, password, otp } = req.body;

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ success: false, message: "Username is already taken" });
    }

    // 3. Verify OTP
    const verification = await Verification.findOne({ email });
    if (!verification || verification.otp !== otp || verification.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // 4. Hash password (12 salt rounds)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Save user into MongoDB
    const user = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
      role: "user", // Default to standard user
      isEmailVerified: true,
    });

    // 6. Delete verification record
    await Verification.deleteOne({ email });

    // 7. Send welcome email asynchronously
    emailService.sendWelcomeEmail(user.email, user.fullName).catch(err => {
      console.error("Welcome email failed to send:", err);
    });

    // 8. Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // 9. Remove password from the response object
    const userResponse = user.toObject();
    delete userResponse.password;

    // 10. Return success response
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Send registration OTP to verify email before registration
 * @route   POST /api/auth/register-otp
 * @access  Public
 */
const sendRegisterOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    // Valid for 10 minutes
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    // Save/update OTP in Verification collection
    await Verification.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { upsert: true, new: true }
    );

    // Send OTP email
    await emailService.sendOTPEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    console.error("Send Register OTP Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    // 1. Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // 2. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // 3. Check account is active
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account is inactive or suspended" });
    }

    // 4. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // 5. Update lastLogin
    user.lastLogin = Date.now();
    await user.save();

    // 6. Generate JWT token
    const token = generateToken({
  userId: user._id,
  email: user.email,
  role: user.role,
});

    // 7. Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // 8. Return success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Initiate forgot password process by sending OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    // 1. Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found with this email" });
    }

    // 3. Generate 6-digit OTP
    const otp = generateOTP();

    // 4. Set OTP expiry (10 minutes from now)
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    // 5. Save OTP in DB
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // 6. Send OTP using emailService
    await emailService.sendOTPEmail(user.email, otp);

    // 7. Return success response
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Verify OTP for password reset
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res) => {
  try {
    // 1. Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, otp } = req.body;

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Compare OTP and check expiry
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // 4. Return success response
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Reset password after OTP verification
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    // 1. Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, otp, newPassword } = req.body;

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Verify OTP and expiry
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // 4. Hash new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);

    // 5. Remove OTP and expiry fields
    user.otp = null;
    user.otpExpiry = null;

    // 6. Save user
    await user.save();

    // 7. Return success response
    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Logout user by clearing refresh token
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // Assuming authMiddleware attaches the authenticated user's ID to req.user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Remove refreshToken
    user.refreshToken = null;
    await user.save();

    // 2. Return success response
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Get currently authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    // 1. Get authenticated user ID from req.user (populated by auth middleware)
    // 2. Find user and exclude password
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Return user profile
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  register,
  sendRegisterOTP,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  logout,
  getCurrentUser,
};