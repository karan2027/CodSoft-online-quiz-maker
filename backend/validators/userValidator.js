const { body } = require("express-validator");

/**
 * Validation rules for updating a user profile.
 * Ensures data integrity and sanitizes input before it reaches the controller.
 */
const updateProfileValidation = [
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters.")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Full name can only contain alphabets and spaces."),

  /*
   * TODO: Future Profile Image Validation
   * 
   * When Multer and Cloudinary are integrated, file existence and MIME type 
   * validation (e.g., ensuring the file is an image/jpeg or image/png) will 
   * be handled primarily by the uploadMiddleware.
   * 
   * However, if the frontend sends a pre-uploaded Cloudinary secure_url 
   * as a string in the body, we will validate it here like so:
   * 
   * body("profileImage")
   *   .optional()
   *   .isURL()
   *   .withMessage("Profile image must be a valid URL.");
   */
];

module.exports = {
  updateProfileValidation,
};