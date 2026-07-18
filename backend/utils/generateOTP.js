const crypto = require("crypto");

/**
 * Generates a cryptographically secure, random numeric One-Time Password (OTP).
 * 
 * @param {number} [length=6] - The desired length of the OTP (default is 6).
 * @returns {string} The generated OTP as a string, preserving any leading zeros.
 * @throws {TypeError} If the length is not a valid integer.
 * @throws {RangeError} If the length is outside the allowed bounds (4 to 10).
 */
const generateOTP = (length = 6) => {
  // 1. Validate that the length is a positive integer
  if (typeof length !== "number" || !Number.isInteger(length)) {
    throw new TypeError("OTP length must be a positive integer.");
  }

  // 2. Enforce the minimum and maximum length constraints
  if (length < 4 || length > 10) {
    throw new RangeError("OTP length must be between 4 and 10 digits.");
  }

  // 3. Calculate the maximum possible value for the given length (exclusive)
  // For length 6, max is 1000000 (so the highest generated number is 999999)
  const max = Math.pow(10, length);

  // 4. Generate a cryptographically secure random integer between 0 and max - 1
  // We use the native crypto module instead of Math.random() for better security.
  const randomNum = crypto.randomInt(0, max);

  // 5. Convert the number to a string and pad with leading zeros if necessary
  return String(randomNum).padStart(length, "0");
};

module.exports = generateOTP;