const { body, param } = require("express-validator");

/**
 * -------------------------------------------------------------------
 * Result Validator Middleware
 * -------------------------------------------------------------------
 * Validates incoming request payloads for the Result module.
 * Ensures data integrity and prevents malformed data from reaching
 * the grading engine (resultController.js).
 */

/**
 * @desc    Validation rules for submitting a quiz attempt
 * @note    Uses wildcard validation (.*.) to deeply inspect objects within the answers array.
 */
const submitQuizValidation = [
  body("quizId")
    .notEmpty()
    .withMessage("Quiz ID is required.")
    .isMongoId()
    .withMessage("Invalid Quiz ID format."),

  body("answers")
    .notEmpty()
    .withMessage("Answers are required.")
    .isArray({ min: 1 })
    .withMessage("Answers must be an array containing at least one answer."),

  // Wildcard validation for deeply nested objects inside the answers array
  body("answers.*.questionId")
    .notEmpty()
    .withMessage("Each answer must contain a valid Question ID.")
    .isMongoId()
    .withMessage("Invalid Question ID format."),

  body("answers.*.selectedOption")
    .notEmpty()
    .withMessage("Selected option is required for each answer.")
    .isInt({ min: 0, max: 3 })
    .withMessage("Selected option must be an integer between 0 and 3."),

  body("timeTaken")
    .notEmpty()
    .withMessage("Time taken is required.")
    .isNumeric()
    .withMessage("Time taken must be a numeric value.")
    .custom((value) => value > 0)
    .withMessage("Time taken must be greater than zero.")
];

/* ==========================================================================
 * TODO: FUTURE SCALABILITY VALIDATIONS
 * ==========================================================================
 * - Negative marking: Validate boolean flags indicating if negative marking applies.
 * - Multiple attempts: Validate attempt metadata if the quiz allows retakes.
 * - Answer explanation validation: Validate subjective text answers if the quiz includes short-answer/essay questions.
 * - Question review: Validate boolean flags if students mark questions for review before final submission.
 * - Subject-wise analytics: Validate category tags associated with individual answers for advanced performance reporting.
 * ========================================================================== */

/**
 * @desc    Validation rules for fetching a specific result by ID
 */
const getResultByIdValidation = [
  param("resultId")
    .notEmpty()
    .withMessage("Result ID is required in the URL parameter.")
    .isMongoId()
    .withMessage("Invalid Result ID format.")
];

module.exports = {
  submitQuizValidation,
  getResultByIdValidation,
};