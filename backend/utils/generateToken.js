const jwt = require("jsonwebtoken");

/**
 * Generates a JSON Web Token (JWT) using the provided payload.
 *
 * @param {Object} payload - The data to encode within the JWT (e.g., { id: user._id }).
 * @returns {string} The generated JWT string.
 * @throws {Error} If environment variables are missing or the payload is empty/missing.
 * @throws {TypeError} If the payload is not a valid object.
 */
const generateToken = (payload) => {
  // 1. Validate Environment Variables
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
  }
  if (!process.env.JWT_EXPIRES_IN) {
    throw new Error("JWT_EXPIRES_IN is not defined in the environment variables.");
  }

  // 2. Validate Payload Presence
  if (!payload) {
    throw new Error("Payload is required to generate a JWT.");
  }

  // 3. Validate Payload Type (Must be an object, not null, not an array)
  if (typeof payload !== "object" || Array.isArray(payload) || payload === null) {
    throw new TypeError("Payload must be a non-array object.");
  }

  // 4. Validate Payload is not empty
  if (Object.keys(payload).length === 0) {
    throw new Error("Payload object cannot be empty.");
  }

  // 5. Generate and Return JWT
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports = generateToken;