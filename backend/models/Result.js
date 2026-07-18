const mongoose = require("mongoose");

/**
 * Answer Sub-Schema
 * Tracks the student's interaction with a single question.
 */
const AnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Question ID is required"],
    },
    selectedOption: {
      type: Number,
      required: [true, "Selected option is required"],
    },
    isCorrect: {
      type: Boolean,
      required: [true, "Correctness status is required"],
    },
    marksAwarded: {
      type: Number,
      default: 0,
    },
    // TODO: Future Integration - Track 'timeTaken' per question for detailed analytics
  },
  { _id: false } // No need for a separate ObjectId for each answer sub-document
);

/**
 * Main Result Schema
 * Represents a single quiz attempt by a student.
 */
const ResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
      index: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz reference is required"],
      index: true,
    },
    answers: {
      type: [AnswerSchema],
      default: [],
    },
    score: {
      type: Number,
      required: [true, "Total score is required"],
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: [true, "Total possible marks are required"],
    },
    percentage: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number,
      required: [true, "Time taken is required"],
      // NOTE: timeTaken is standardized and stored in SECONDS
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["completed", "submitted", "expired"],
      default: "completed",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    
    // TODO: Future Integration - Leaderboard system flagging (e.g., isHighScore)
    // TODO: Future Integration - Digital Quiz Certificates generation triggers
    // TODO: Future Integration - AI performance analysis summary text
    // TODO: Future Integration - Negative marking adjustments flag
    // TODO: Future Integration - Subject-wise/Category statistics caching
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Compound Index
 * Optimizes queries that filter by both student and quiz (e.g., checking if a student 
 * has already taken a specific quiz, or retrieving their best attempt for a specific quiz).
 */
ResultSchema.index({ student: 1, quiz: 1 });

/**
 * Pre-save Middleware
 * Automatically calculates the percentage based on score and totalMarks.
 * Prevents zero-division errors and rounds to exactly two decimal places.
 */
ResultSchema.pre("save", function () {
  if (this.totalMarks > 0) {
    const rawPercentage = (this.score / this.totalMarks) * 100;
    // Round to 2 decimal places (e.g., 85.556 -> 85.56)
    this.percentage = Math.round(rawPercentage * 100) / 100;
  } else {
    this.percentage = 0;
  }
});

module.exports = mongoose.model("Result", ResultSchema);