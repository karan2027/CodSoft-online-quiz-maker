const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * JWT Authentication Middleware
 * Protects private routes by verifying the presence and validity of a JWT token.
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Read Authorization header
    const authHeader = req.headers.authorization || req.header("Authorization");

    // 2. Expect the format: Bearer <token>
    // 3. If header is missing or incorrect format, return 401
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // 4. Extract JWT token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // 5. Verify token using process.env.JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 7. Find user from MongoDB using decoded.id, excluding the password field
    const user = await User.findById(decoded.userId).select("-password");

    // 8. If user is not found in the database
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // 9. Attach the authenticated user to the request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // 6. If token is invalid or expired
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    // Handle any other unexpected errors
    console.error("[Auth Middleware Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = authMiddleware;