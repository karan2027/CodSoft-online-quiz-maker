/**
 * Intercepts explicit requests aimed at unmapped routing paths.
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource Not Found - Location Requested: [${req.method}] ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized Application Error Boundary Middleware.
 * Captures thrown operational errors and enforces your strict JSON contract wrapper.
 */
const errorHandler = (err, req, res, next) => {
  // Ensure we fall back to a 500 internal server error code if one isn't explicitly set
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Catch Mongoose Invalid Cast Exception IDs (e.g., /api/quizzes/invalid-id)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Resource integrity violation. Malformed database identifier key.';
  }

  // Catch Mongoose Validation Constraints Failures
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Catch Duplicate Key Constraints Exceptions (e.g., Registering an existing email account)
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate resource entry parameter detected: ${Object.keys(err.keyValue)} must remain distinct.`;
  }

  // Format client standard return trace contract signature
  res.status(statusCode).json({
    success: false,
    message: message || 'An unhandled structural background exception occurred on our core server context.'
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};