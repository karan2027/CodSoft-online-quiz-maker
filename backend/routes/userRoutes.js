const express = require("express");
const router = express.Router();

// Import User Controllers
const {
  getUserProfile,
  updateUserProfile,
  getUserDashboardStats,
  changePassword,
  deleteAccount,
  getNotifications,
  markNotificationAsRead,
  clearAllNotifications,
  getActivityLogs,
} = require("../controllers/userController");

// Import Authentication Middleware
const authMiddleware = require("../middleware/authMiddleware");

// Import Upload Middleware
const { uploadProfileImage } = require("../middleware/uploadMiddleware");

/**
 * @route   GET /api/users/profile
 * @desc    Get current logged-in user's profile
 * @access  Private
 */
router.get("/profile", authMiddleware, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current logged-in user's profile details and avatar
 * @access  Private
 */
router.put("/profile", authMiddleware, uploadProfileImage, updateUserProfile);

/**
 * @route   GET /api/users/stats
 * @desc    Get dashboard statistics for the logged-in user
 * @access  Private
 */
router.get("/stats", authMiddleware, getUserDashboardStats);

/**
 * @route   POST /api/users/change-password
 * @desc    Change logged-in user password
 * @access  Private
 */
router.post("/change-password", authMiddleware, changePassword);

/**
 * @route   DELETE /api/users/delete-account
 * @desc    Delete user account and all references
 * @access  Private
 */
router.delete("/delete-account", authMiddleware, deleteAccount);

/**
 * @route   GET /api/users/notifications
 * @desc    Get all user notifications
 * @access  Private
 */
router.get("/notifications", authMiddleware, getNotifications);

/**
 * @route   PATCH /api/users/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch("/notifications/:id/read", authMiddleware, markNotificationAsRead);

/**
 * @route   DELETE /api/users/notifications
 * @desc    Clear all notifications
 * @access  Private
 */
router.delete("/notifications", authMiddleware, clearAllNotifications);

/**
 * @route   GET /api/users/activity
 * @desc    Get user activity logs
 * @access  Private
 */
router.get("/activity", authMiddleware, getActivityLogs);

module.exports = router;