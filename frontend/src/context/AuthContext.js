import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext(null);

const TOKEN_KEY = "quiz_token";
const USER_KEY = "quiz_user";

const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, trust locally stored session first (fast), then verify with backend
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        // Verify token is still valid against the backend
        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.user);
        } else {
          // Token expired/invalid — clear session
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);

    const result = await authService.login(email, password);

    if (result.success) {
      setToken(result.token);
      setUser(result.user);
    }

    setLoading(false);
    return result;
  };

  const register = async (userData) => {
    setLoading(true);

    const result = await authService.register(userData);

    if (result.success && result.token) {
      setToken(result.token);
      setUser(result.user);
    }

    setLoading(false);
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateUser = useCallback((updatedUserData = {}) => {
    setUser(prevUser => {
      const nextUser = { ...prevUser, ...updatedUserData };
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, loading, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};