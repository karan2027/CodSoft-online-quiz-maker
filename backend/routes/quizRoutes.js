const express = require("express");
const router = express.Router();

// Import Quiz Controllers
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  joinQuiz,
  getMyQuizzes,
  bookmarkQuiz,
  unbookmarkQuiz,
  getBookmarkedQuizzes,
  rateQuiz,
  addComment,
  getQuizComments,
  deleteComment,
} = require("../controllers/quizController");

// Import Result Controller for unified submission routing
const { submitQuiz } = require("../controllers/resultController");

// Import Quiz Validators
const {
  createQuizValidation,
  updateQuizValidation,
  joinQuizValidation,
} = require("../validators/quizValidator");

// Import Authentication Middleware
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

// Import Upload Middleware
const { uploadQuizImage } = require("../middleware/uploadMiddleware");

/**
 * -------------------------------------------------------------------
 * STATIC ROUTING (Specific static paths first to prevent parameter collisions)
 * -------------------------------------------------------------------
 */

// Fetch all quizzes (supports pagination, filtering, sorting, searching)
router.get("/", getAllQuizzes);

// Get quizzes created by logged-in user
router.get("/my", authMiddleware, getMyQuizzes);

// Get user's bookmarked quizzes
router.get("/bookmarked", authMiddleware, getBookmarkedQuizzes);

// Join a quiz using a quizCode
router.post("/join", authMiddleware, joinQuizValidation, joinQuiz);

/**
 * -------------------------------------------------------------------
 * DYNAMIC ROUTING
 * -------------------------------------------------------------------
 */

// Get comments for a quiz
router.get("/:id/comments", getQuizComments);

// Get a single quiz details (Public, but behaves differently if creator is logged in)
router.get("/:id", optionalAuthMiddleware, getQuizById);

// Delete comment (private)
router.delete("/comments/:commentId", authMiddleware, deleteComment);

/**
 * -------------------------------------------------------------------
 * DYNAMIC ROUTING
 * -------------------------------------------------------------------
 */

// Create a new quiz (with optional thumbnail upload)
router.post("/", authMiddleware, uploadQuizImage, createQuizValidation, createQuiz);

// Update an existing quiz (with optional thumbnail update)
router.put("/:id", authMiddleware, uploadQuizImage, updateQuizValidation, updateQuiz);

// Delete a quiz
router.delete("/:id", authMiddleware, deleteQuiz);

// Bookmark a quiz
router.post("/:id/bookmark", authMiddleware, bookmarkQuiz);

// Unbookmark a quiz
router.delete("/:id/bookmark", authMiddleware, unbookmarkQuiz);

// Rate a quiz (1 to 5 stars)
router.post("/:id/rate", authMiddleware, rateQuiz);

// Add a comment/reply
router.post("/:id/comment", authMiddleware, addComment);

// Unified Quiz Submission route
router.post("/:id/submit", authMiddleware, submitQuiz);

module.exports = router;