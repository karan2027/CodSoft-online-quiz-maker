import api from "./api";

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || fallback;
};

/**
 * Fetch current user profile details from backend.
 */
export const getUserProfile = async () => {
  try {
    const res = await api.get("/users/profile");
    return {
      success: true,
      message: res.data.message,
      data: res.data.user,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Unable to fetch profile."),
    };
  }
};

/**
 * Update user profile details (supports multipart form-data for avatar upload).
 */
export const updateUserProfile = async (userData) => {
  try {
    const headers =
      userData instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

    const res = await api.put("/users/profile", userData, { headers });
    return {
      success: true,
      message: res.data.message,
      data: res.data.user,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Unable to update profile."),
    };
  }
};

/**
 * Change logged-in user password.
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const res = await api.post("/users/change-password", {
      currentPassword,
      newPassword,
    });
    return {
      success: true,
      message: res.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Password change failed."),
    };
  }
};

/**
 * Delete user account and all references.
 */
export const deleteAccount = async () => {
  try {
    const res = await api.delete("/users/delete-account");
    return {
      success: true,
      message: res.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Account deletion failed."),
    };
  }
};

/**
 * Fetch statistics summary for dashboard.
 */
export const getUserStatistics = async () => {
  try {
    const res = await api.get("/users/stats");
    return {
      success: true,
      message: res.data.message,
      data: res.data.stats,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Unable to fetch statistics."),
    };
  }
};

/**
 * Fetch recent activity feed logs.
 */
export const getRecentActivity = async () => {
  try {
    const res = await api.get("/users/activity");
    return {
      success: true,
      message: res.data.message,
      data: res.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Unable to fetch activity logs."),
    };
  }
};

/**
 * Fetch user notifications.
 */
export const getNotifications = async () => {
  try {
    const res = await api.get("/users/notifications");
    return {
      success: true,
      message: res.data.message,
      data: res.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Unable to fetch notifications."),
    };
  }
};

/**
 * Mark a single notification as read.
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const res = await api.patch(`/users/notifications/${notificationId}/read`);
    return {
      success: true,
      message: res.data.message,
      data: res.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Unable to mark notification as read."),
    };
  }
};

/**
 * Clear all notifications.
 */
export const clearAllNotifications = async () => {
  try {
    const res = await api.delete("/users/notifications");
    return {
      success: true,
      message: res.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Unable to clear notifications."),
    };
  }
};