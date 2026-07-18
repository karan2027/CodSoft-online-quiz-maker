const mongoose = require("mongoose");

/**
 * Question Sub-Schema
 * Embeds questions directly inside the Quiz document for optimized read performance.
 */
const QuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required"],
    },
    image: {
      type: String,
      default: "",
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length >= 2 && v.length <= 4;
        },
        message: "A question must have between 2 and 4 options.",
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, "Correct answer index is required"],
      min: 0,
      max: 3,
    },
    marks: {
      type: Number,
      default: 1,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    explanation: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

/**
 * Main Quiz Schema
 * Represents the complete structure of a quiz, its settings, and metadata.
 */
const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
      index: true,
      default: "",
    },
    quizImage: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizCode: {
      type: String,
      required: [true, "Quiz code is required"],
      unique: true,
      trim: true,
      minlength: 6,
      maxlength: 8,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    allowMultipleAttempts: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: null,
    },
    questions: {
      type: [QuestionSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "A quiz must contain at least one question.",
      },
    },
    // Settings
    timeLimit: {
      type: Number,
      min: [1, "Time limit must be at least 1 minute"],
      max: [300, "Time limit cannot exceed 300 minutes"],
      default: 10,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    // Statistics & Analytics
    attemptCount: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    highestScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Pre-save middleware to automatically calculate totalMarks 
 * based on the sum of marks for all questions in the quiz.
 */
QuizSchema.pre("save", function () {
  if (this.questions && this.questions.length > 0) {
    this.totalMarks = this.questions.reduce((total, q) => total + (q.marks || 1), 0);
  }
  // Synchronize isPublished with status
  this.isPublished = this.status === "published";
});

module.exports = mongoose.model("Quiz", QuizSchema);