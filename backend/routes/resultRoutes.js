const express = require("express");
const router = express.Router();

// Import Authentication Middleware
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

// Import Result Validators
const { submitQuizValidation } = require("../validators/resultValidator");

// Import Result Controllers
const {
  submitQuiz,
  getMyResults,
  getResultById,
  getLeaderboard,
} = require("../controllers/resultController");

/**
 * -------------------------------------------------------------------
 * RESULT ROUTES
 * -------------------------------------------------------------------
 */

/**
 * @route   POST /api/results/submit
 * @desc    Submit a quiz attempt and calculate the score
 * @access  Private (Requires valid JWT)
 */
router.post("/submit", authMiddleware, submitQuizValidation, submitQuiz);

/**
 * @route   GET /api/results/my-results
 * @desc    Fetch all quiz attempts for the logged-in student
 * @access  Private (Requires valid JWT)
 * @note    Must be declared BEFORE /:resultId to prevent route parameter collision
 */
router.get("/my-results", authMiddleware, getMyResults);

/**
 * @route   GET /api/results/leaderboard/:quizId
 * @desc    Get leaderboard (top scores) for a specific quiz
 * @access  Private (Requires valid JWT)
 */
router.get("/leaderboard/:quizId", optionalAuthMiddleware, getLeaderboard);

/**
 * @route   GET /api/results/:resultId
 * @desc    Fetch detailed view of a specific quiz result
 * @access  Private (Requires valid JWT)
 */
router.get("/:resultId", authMiddleware, getResultById);

/* ==========================================================================
 * TODO: FUTURE SCALABILITY ROUTES
 * ==========================================================================
 * - Leaderboard: GET /api/results/leaderboard/:quizId (Top scores for a quiz)
 * - Student Analytics: GET /api/results/analytics/student (Subject-wise performance)
 * - Teacher Analytics: GET /api/results/analytics/quiz/:quizId (Class average, drop-offs)
 * - Delete Result: DELETE /api/results/:resultId (Admin/Teacher override)
 * - Export Result PDF: GET /api/results/:resultId/export (Download detailed report)
 * - Certificate Download: GET /api/results/:resultId/certificate (Generate PDF certificate)
 * ========================================================================== */

module.exports = router;