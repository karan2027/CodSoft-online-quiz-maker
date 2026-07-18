const crypto = require("crypto");
const Quiz = require("../models/Quiz");

/**
 * -------------------------------------------------------------------
 * Unique Quiz Code Generator Utility
 * -------------------------------------------------------------------
 * Generates a random, user-friendly 6-character alphanumeric code.
 * Ensures absolute uniqueness by checking the database before returning.
 */

/**
 * @desc    Generates a unique quiz code.
 * @returns {Promise<String>} A unique 6-character string.
 * @throws  {Error} If a unique code cannot be generated after maximum retries.
 */
const generateQuizCode = async () => {
  // Allowed characters: Uppercase letters and numbers.
  // Excluded: 'O', '0', 'I', '1', 'L' to prevent visual ambiguity for users.
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const codeLength = 6;
  const maxRetries = 20;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let quizCode = "";

    // 1. Generate the random string securely
    for (let i = 0; i < codeLength; i++) {
      // crypto.randomInt(min, max) returns a secure integer between min (inclusive) and max (exclusive)
      const randomIndex = crypto.randomInt(0, chars.length);
      quizCode += chars[randomIndex];
    }

    // 2. Verify uniqueness in the database
    // Using lean() for a faster query since we don't need a full Mongoose document here
    const existingQuiz = await Quiz.findOne({ quizCode }).lean();

    // 3. If no existing quiz shares this code, it is unique and safe to use
    if (!existingQuiz) {
      return quizCode;
    }

    // If collision happens, the loop will automatically retry
  }

  // 4. Fallback if the database is incredibly saturated or random generation fails repeatedly
  throw new Error(
    "System error: Unable to generate a unique quiz code after multiple attempts. Please try again later."
  );
};

/* ==========================================================================
 * TODO: FUTURE SCALABILITY INTEGRATIONS
 * ==========================================================================
 * - Variable code lengths: Allow passing a `length` parameter to scale up to 8 or 10 chars as the DB grows.
 * - Configurable character sets: Allow different formats (e.g., lowercase, hyphens).
 * - Invitation links: Return an object containing both the raw code and a formatted joining URL.
 * - QR code generation: Integrate a library to return a base64 QR code image string representing the code.
 * - Expiration-based codes: Create a separate collection to recycle codes 30 days after a quiz ends.
 * ========================================================================== */

module.exports = generateQuizCode;