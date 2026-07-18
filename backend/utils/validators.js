const mongoose = require("mongoose");

/**
 * -------------------------------------------------------------------
 * Pure Utility Validators
 * -------------------------------------------------------------------
 * These are stateless, reusable helper functions decoupled from the 
 * Express HTTP layer. They provide a single source of truth for data 
 * integrity checks across models, services, and internal controller logic.
 */

/**
 * @desc    Checks if an email string is formatted correctly.
 * @param   {String} email
 * @returns {Boolean}
 * @usage   Used in User model hooks and email service integrations.
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  // Professional standard RFC 5322 regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @desc    Enforces strict password complexity requirements.
 *          Rules: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
 * @param   {String} password
 * @returns {Boolean}
 * @usage   Used in Auth controllers/services before password hashing.
 */
const isStrongPassword = (password) => {
  if (!password || typeof password !== "string") return false;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * @desc    Validates if a given string is a mathematically valid MongoDB ObjectId.
 * @param   {String} id
 * @returns {Boolean}
 * @usage   Used to prevent CastErrors when querying the database dynamically.
 */
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * @desc    Validates if a quiz code matches our exact platform standards.
 *          Rules: Exactly 6 characters, uppercase letters, and numbers only.
 * @param   {String} code
 * @returns {Boolean}
 * @usage   Used in the joining logic to reject malformed codes instantly.
 */
const isValidQuizCode = (code) => {
  if (!code || typeof code !== "string") return false;
  const quizCodeRegex = /^[A-Z0-9]{6}$/;
  return quizCodeRegex.test(code);
};

/**
 * @desc    Checks if a given date string or object occurs in the future.
 * @param   {Date|String} date
 * @returns {Boolean}
 * @usage   Used when scheduling quizzes (startDate, endDate validations).
 */
const isFutureDate = (date) => {
  if (!date) return false;
  const parsedDate = new Date(date);
  
  // Ensure the date is valid before comparing
  if (isNaN(parsedDate.getTime())) return false;
  
  return parsedDate > new Date();
};

/**
 * @desc    Sanitizes raw text by removing leading/trailing whitespace 
 *          and collapsing multiple internal spaces into a single space.
 * @param   {String} text
 * @returns {String}
 * @usage   Used to clean user inputs (e.g., quiz descriptions, names) before saving.
 */
const sanitizeText = (text) => {
  if (!text || typeof text !== "string") return "";
  return text.trim().replace(/\s+/g, " ");
};

/* ==========================================================================
 * TODO: FUTURE VALIDATION HELPERS
 * ==========================================================================
 * - isPhoneNumber(phone): Validate E.164 standard phone numbers via regex.
 * - isValidUrl(url): Use the native URL() constructor to validate web links.
 * - isValidUsername(username): Restrict to alphanumerics and underscores, min 3 chars.
 * - generateSlug(text): Convert "My Quiz Title" into "my-quiz-title" for URLs.
 * - validatePagination(page, limit): Ensure values are integers >= 1.
 * - isAllowedFileType(mimeType): Check buffers/files against allowed extensions.
 * - isValidDateRange(start, end): Ensure start date precedes end date.
 * ========================================================================== */

module.exports = {
  isValidEmail,
  isStrongPassword,
  isValidObjectId,
  isValidQuizCode,
  isFutureDate,
  sanitizeText,
};