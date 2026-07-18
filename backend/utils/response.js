/**
 * -------------------------------------------------------------------
 * API Response Formatter Utility
 * -------------------------------------------------------------------
 * This file centralizes and standardizes all outgoing HTTP responses.
 * By routing all controller responses through these helpers, we ensure
 * a consistent JSON structure (success, message, data/errors) across 
 * the entire platform, greatly improving frontend predictability.
 */

/**
 * @desc    Sends a standardized success response.
 * @param   {Object} res - Express response object.
 * @param   {Number} statusCode - HTTP status code (e.g., 200).
 * @param   {String} message - Success message.
 * @param   {any} [data=null] - Optional payload (object, array, etc.).
 * @returns {Object} JSON response.
 */
const sendSuccess = (res, statusCode, message, data = null) => {
  const responsePayload = {
    success: true,
    message,
  };

  // Only attach the data property if data is actually provided
  if (data !== null) {
    responsePayload.data = data;
  }

  return res.status(statusCode).json(responsePayload);
};

/**
 * @desc    Sends a standardized error response.
 * @param   {Object} res - Express response object.
 * @param   {Number} statusCode - HTTP error status code (e.g., 401, 403, 404, 500).
 * @param   {String} message - Error description.
 * @param   {any} [errors=null] - Optional detailed errors (e.g., array of field errors).
 * @returns {Object} JSON response.
 */
const sendError = (res, statusCode, message, errors = null) => {
  const responsePayload = {
    success: false,
    message,
  };

  // Only attach the errors property if detailed errors are provided
  if (errors !== null) {
    responsePayload.errors = errors;
  }

  return res.status(statusCode).json(responsePayload);
};

/**
 * @desc    Wrapper for 400 Bad Request validation errors.
 * @param   {Object} res - Express response object.
 * @param   {Array|Object} errors - Detailed validation errors from express-validator.
 * @returns {Object} JSON response.
 */
const sendValidationError = (res, errors) => {
  return sendError(res, 400, "Validation failed", errors);
};

/**
 * @desc    Wrapper for 201 Created success responses.
 * @param   {Object} res - Express response object.
 * @param   {String} message - Success message indicating resource creation.
 * @param   {any} [data=null] - The newly created resource.
 * @returns {Object} JSON response.
 */
const sendCreated = (res, message, data = null) => {
  return sendSuccess(res, 201, message, data);
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendCreated,
};