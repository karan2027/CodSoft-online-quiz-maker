import api from "./api";

const TOKEN_KEY = "quiz_token";
const USER_KEY = "quiz_user";

const saveAuthData = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const getStoredUser = () => {
  const storedUser = localStorage.getItem(USER_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
};

// Helper: extract a clean error message from an axios error
const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || fallback;
};

export const login = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;

    saveAuthData(token, user);

    return { success: true, message: res.data.message, token, user };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Login failed. Please try again."),
    };
  }
};

export const register = async (userData = {}) => {
  try {
    const res = await api.post("/auth/register", {
      fullName: userData.fullName || userData.name,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      otp: userData.otp,
    });

    const { token, user } = res.data;

    // Backend already returns a token on register — log the user in immediately
    if (token && user) {
      saveAuthData(token, user);
    }

    return { success: true, message: res.data.message, token, user };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Registration failed. Please try again."),
    };
  }
};

export const sendRegisterOTP = async (email) => {
  try {
    const res = await api.post("/auth/register-otp", { email });
    return { success: true, message: res.data.message };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Unable to send OTP. Please try again."),
    };
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await api.post("/auth/forgot-password", { email });
    return { success: true, message: res.data.message, email };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Unable to send OTP. Please try again."),
    };
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const res = await api.post("/auth/verify-otp", { email, otp });
    return { success: true, message: res.data.message, email };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "OTP verification failed. Please try again."),
    };
  }
};

export const resetPassword = async (email, otp, newPassword) => {
  try {
    const res = await api.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return { success: true, message: res.data.message, email };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Password reset failed. Please try again."),
    };
  }
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
    clearAuthData();
    return { success: true, message: "Logout successful." };
  } catch (error) {
    // Clear local data regardless of server response
    clearAuthData();
    return {
      success: false,
      message: getErrorMessage(error, "Logout failed. Please try again."),
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await api.get("/auth/me");
    const user = res.data.user;

    // Keep local cache in sync with server truth
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { success: true, user };
  } catch (error) {
    clearAuthData();
    return {
      success: false,
      user: null,
      message: getErrorMessage(error, "Unable to get current user."),
    };
  }
};

// Fast, local-only check (no network call) — useful for route guards
export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = getStoredUser();
  return Boolean(token && user);
};