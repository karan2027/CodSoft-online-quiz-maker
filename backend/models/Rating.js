const mongoose = require("mongoose");

/**
 * Rating Schema
 * Allows users to rate a quiz between 1 and 5 stars.
 */
const RatingSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
  },
  { timestamps: true }
);

// Enforce unique ratings per user per quiz
RatingSchema.index({ user: 1, quiz: 1 }, { unique: true });

module.exports = mongoose.model("Rating", RatingSchema);
