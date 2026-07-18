const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");
const Bookmark = require("../models/Bookmark");
const Rating = require("../models/Rating");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");
const cloudinary = require("../config/cloudinary");

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private (Requires JWT)
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -otp -otpExpiry -refreshToken"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("[UserController - getUserProfile Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching profile.",
    });
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/users/profile
 * @access  Private (Requires JWT)
 */
const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { fullName, username, bio, socialLinks } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (fullName) user.fullName = fullName;

    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Username is already taken." });
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;

    if (socialLinks) {
      const parsedSocial = typeof socialLinks === "string" ? JSON.parse(socialLinks) : socialLinks;
      user.socialLinks = {
        twitter: parsedSocial.twitter !== undefined ? parsedSocial.twitter : user.socialLinks?.twitter || "",
        github: parsedSocial.github !== undefined ? parsedSocial.github : user.socialLinks?.github || "",
        linkedin: parsedSocial.linkedin !== undefined ? parsedSocial.linkedin : user.socialLinks?.linkedin || "",
        website: parsedSocial.website !== undefined ? parsedSocial.website : user.socialLinks?.website || "",
      };
    }

    if (req.file) {
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const uploadRes = await cloudinary.uploader.upload(dataUri, {
        folder: "profiles",
        resource_type: "image",
      });
      user.profileImage = uploadRes.secure_url;
    }

    await user.save();

    await ActivityLog.create({
      user: user._id,
      activity: "Updated profile details",
    });

    const updatedUser = user.toObject();
    delete updatedUser.password;
    delete updatedUser.otp;
    delete updatedUser.otpExpiry;
    delete updatedUser.refreshToken;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("[UserController - updateUserProfile Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while updating profile.",
    });
  }
};

/**
 * @desc    Get user dashboard statistics
 * @route   GET /api/users/stats
 * @access  Private (Requires JWT)
 */
const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Quizzes created by the user
    const createdQuizzes = await Quiz.find({ createdBy: userId });

    // 2. Quiz attempts by the user
    const attempts = await Result.find({ student: userId }).populate("quiz", "title category difficulty");

    // 3. Calculation of scores
    const totalQuizzesAttempted = attempts.length;
    let averageScore = 0;
    let highestScore = 0;
    if (totalQuizzesAttempted > 0) {
      highestScore = Math.max(...attempts.map(a => a.percentage));
      const totalPercentage = attempts.reduce((acc, a) => acc + a.percentage, 0);
      averageScore = Math.round((totalPercentage / totalQuizzesAttempted) * 100) / 100;
    }

    // 4. Bookmarks count
    const bookmarksCount = await Bookmark.countDocuments({ user: userId });

    // 5. Recent Activity
    const recentActivity = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Stats for quizzes created by the user
    let totalAttemptsOnMyQuizzes = 0;
    let myQuizzesAvgScore = 0;
    if (createdQuizzes.length > 0) {
      totalAttemptsOnMyQuizzes = createdQuizzes.reduce((acc, q) => acc + (q.attemptCount || 0), 0);
      const activeQuizzes = createdQuizzes.filter(q => q.attemptCount > 0);
      if (activeQuizzes.length > 0) {
        const sumAvg = activeQuizzes.reduce((acc, q) => acc + q.averageScore, 0);
        myQuizzesAvgScore = Math.round((sumAvg / activeQuizzes.length) * 100) / 100;
      }
    }

    const dashboardStats = {
      totalQuizzesAttempted,
      averageScore,
      highestScore,
      bookmarksCount,
      totalQuizzesCreated: createdQuizzes.length,
      totalAttemptsOnMyQuizzes,
      myQuizzesAvgScore,
      recentActivity,
    };

    return res.status(200).json({
      success: true,
      stats: dashboardStats,
    });
  } catch (error) {
    console.error("[UserController - getUserDashboardStats Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching statistics.",
    });
  }
};

/**
 * @desc    Change user password
 * @route   POST /api/users/change-password
 * @access  Private (Requires JWT)
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both current and new passwords are required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password." });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await ActivityLog.create({
      user: req.user._id,
      activity: "Changed account password",
    });

    await Notification.create({
      user: req.user._id,
      title: "Password Changed",
      message: "Your account password was changed successfully.",
      type: "password_changed",
    });

    return res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Delete user account and all owned records
 * @route   DELETE /api/users/delete-account
 * @access  Private (Requires JWT)
 */
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const userId = req.user._id;
    await Result.deleteMany({ student: userId });
    await Bookmark.deleteMany({ user: userId });
    await Notification.deleteMany({ user: userId });
    await Rating.deleteMany({ user: userId });
    await Comment.deleteMany({ user: userId });
    await ActivityLog.deleteMany({ user: userId });
    await Quiz.deleteMany({ createdBy: userId });

    await user.deleteOne();

    return res.status(200).json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    console.error("Delete Account Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Get all notifications for logged-in user
 * @route   GET /api/users/notifications
 * @access  Private (Requires JWT)
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/users/notifications/:id/read
 * @access  Private (Requires JWT)
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error("Mark Notification Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Clear all notifications for logged-in user
 * @route   DELETE /api/users/notifications
 * @access  Private (Requires JWT)
 */
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    return res.status(200).json({ success: true, message: "All notifications cleared." });
  } catch (error) {
    console.error("Clear Notifications Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Get user activity logs
 * @route   GET /api/users/activity
 * @access  Private (Requires JWT)
 */
const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Get Activity Logs Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserDashboardStats,
  changePassword,
  deleteAccount,
  getNotifications,
  markNotificationAsRead,
  clearAllNotifications,
  getActivityLogs,
};