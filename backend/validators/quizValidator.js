const { body, check } = require("express-validator");

/**
 * @desc    Validation rules for creating a new quiz
 */
const createQuizValidation = [
  body("title")
    .notEmpty()
    .withMessage("Quiz title is required.")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters."),
    
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
    
  body("category")
    .notEmpty()
    .withMessage("Category is required.")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Category must be between 3 and 50 characters."),
    
  body("difficulty")
    .notEmpty()
    .withMessage("Difficulty level is required.")
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be either 'easy', 'medium', or 'hard'."),
    
  body("timeLimit")
    .notEmpty()
    .withMessage("Time limit is required.")
    .isInt({ min: 1, max: 300 })
    .withMessage("Time limit must be an integer between 1 and 300 minutes."),
    
  body("questions")
    .notEmpty()
    .withMessage("Questions array is required.")
    .isArray({ min: 1 })
    .withMessage("A quiz must contain at least one question."),
    
  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean value."),
    
  body("password")
    .optional()
    .isLength({ min: 4, max: 20 })
    .withMessage("If provided, password must be between 4 and 20 characters.")
];

/**
 * @desc    Validation rules for updating an existing quiz
 */
const updateQuizValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters."),
    
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
    
  body("category")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Category must be between 3 and 50 characters."),
    
  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be either 'easy', 'medium', or 'hard'."),
    
  body("timeLimit")
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage("Time limit must be an integer between 1 and 300 minutes."),
    
  body("questions")
    .optional()
    .isArray({ min: 1 })
    .withMessage("A quiz must contain at least one question."),
    
  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean value."),
    
  body("password")
    .optional()
    .isLength({ min: 4, max: 20 })
    .withMessage("If provided, password must be between 4 and 20 characters.")
];

/**
 * @desc    Validation rules for joining a private or specific quiz
 */
const joinQuizValidation = [
  body("quizCode")
    .notEmpty()
    .withMessage("Quiz code is required.")
    .trim()
    .isAlphanumeric()
    .withMessage("Quiz code must contain only letters and numbers.")
    .isLength({ min: 6, max: 8 })
    .withMessage("Quiz code must be between 6 and 8 characters long."),
    
  body("password")
    .optional()
    .isString()
    .withMessage("Password must be a valid string.")
];

/**
 * @desc    Validation rules for submitting quiz answers
 */
const submitQuizValidation = [
  body("answers")
    .notEmpty()
    .withMessage("Answers are required to submit the quiz.")
    .isArray({ min: 1 })
    .withMessage("You must submit at least one answer."),
    
  /*
   * TODO: Implement deeper nested validation for the 'answers' array.
   * Once the Quiz and Result schemas are fully finalized, we can validate 
   * the internal structure of each answer object in the array using wildcards:
   * 
   * check("answers.*.questionId")
   *   .notEmpty()
   *   .withMessage("Question ID is required for each answer.")
   *   .isMongoId()
   *   .withMessage("Invalid Question ID format."),
   * 
   * check("answers.*.selectedOption")
   *   .notEmpty()
   *   .withMessage("Selected option is required for each answer.")
   *   .isString()
   *   .withMessage("Selected option must be a string.")
   */
];

module.exports = {
  createQuizValidation,
  updateQuizValidation,
  joinQuizValidation,
  submitQuizValidation,
};