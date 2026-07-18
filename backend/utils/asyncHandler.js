/**
 * -------------------------------------------------------------------
 * Async Handler Utility
 * -------------------------------------------------------------------
 * A wrapper for Express async route handlers that eliminates the need 
 * for repetitive try...catch blocks. It automatically catches rejected 
 * promises and forwards them to the centralized Express error middleware.
 */

/**
 * @desc    Wraps an async controller function to handle promise rejections.
 * @param   {Function} fn - The asynchronous Express controller function.
 * @returns {Function} A new Express middleware function.
 * 
 * @example
 * // Controller Usage:
 * const getUserProfile = asyncHandler(async (req, res, next) => {
 *     const user = await User.findById(req.user._id);
 *     if (!user) throw new Error("User not found");
 *     res.json(user);
 * });
 */
const asyncHandler = (fn) => (req, res, next) => {
  // Execute the controller function (fn) and resolve it as a Promise.
  // If the promise rejects (e.g., a database error or manual throw),
  // the .catch(next) block captures the error and passes it to next(error),
  // triggering the centralized errorMiddleware.js.
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;