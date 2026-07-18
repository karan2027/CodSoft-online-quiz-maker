const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Optional JWT Authentication Middleware
 * Parses token if present, but does NOT throw error if missing.
 * Used for public routes that have enhanced functionality for logged-in users.
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore token errors, treat as not logged in
    next();
  }
};

module.exports = optionalAuthMiddleware;
