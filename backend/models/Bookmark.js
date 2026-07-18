const mongoose = require("mongoose");

/**
 * Bookmark Schema
 * Maps users to the quizzes they bookmark.
 */
const BookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Enforce unique bookmarks per user
BookmarkSchema.index({ user: 1, quiz: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", BookmarkSchema);
