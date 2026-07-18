const generateOTP = require("../utils/generateOTP");

/**
 * Generates a 6-digit OTP and calculates its expiration time.
 * 
 * @returns {Object} An object containing the OTP string and a Date object for expiration.
 */
const createOTP = () => {
  const otp = generateOTP(6);
  // Set expiration time to 10 minutes from the current time
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  return {
    otp,
    expiresAt,
  };
};

/**
 * Checks if a given expiration date has passed.
 * 
 * @param {Date|string|number} expiresAt - The expiration timestamp or Date object.
 * @returns {boolean} True if the OTP has expired, false otherwise.
 */
const isOTPExpired = (expiresAt) => {
  const currentTime = new Date();
  const expirationTime = new Date(expiresAt);
  
  return currentTime > expirationTime;
};

/**
 * Verifies an entered OTP against the stored OTP and checks for expiration.
 * 
 * @param {string} storedOTP - The OTP previously generated and saved (e.g., in the database).
 * @param {string} enteredOTP - The OTP provided by the user.
 * @param {Date|string|number} expiresAt - The expiration timestamp of the stored OTP.
 * @returns {Object} An object containing the success status and a descriptive message.
 */
const verifyOTP = (storedOTP, enteredOTP, expiresAt) => {
  if (isOTPExpired(expiresAt)) {
    return {
      success: false,
      message: "OTP has expired.",
    };
  }

  if (storedOTP !== enteredOTP) {
    return {
      success: false,
      message: "Invalid OTP.",
    };
  }

  return {
    success: true,
    message: "OTP verified successfully.",
  };
};

module.exports = {
  createOTP,
  isOTPExpired,
  verifyOTP,
};