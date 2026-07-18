const crypto = require("crypto");
const { validationResult } = require("express-validator");
const Quiz = require("../models/Quiz");
const User = require("../models/User");
const Bookmark = require("../models/Bookmark");
const Rating = require("../models/Rating");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");
const cloudinary = require("../config/cloudinary");
const generateQuizCode = require("../utils/generateQuizCode");

/**
 * @desc    Create a new quiz
 * @route   POST /api/quizzes
 * @access  Private
 */
const createQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      subcategory,
      difficulty,
      timeLimit,
      questions,
      isPublic,
      password,
      status, // "draft" or "published"
      tags,
    } = req.body;

    let quizImage = "";
    if (req.file) {
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const uploadRes = await cloudinary.uploader.upload(dataUri, {
        folder: "quizzes",
        resource_type: "image",
      });
      quizImage = uploadRes.secure_url;
    } else if (req.body.quizImage) {
      quizImage = req.body.quizImage;
    }

    const quizCode = await generateQuizCode();

    const parsedQuestions = typeof questions === "string" ? JSON.parse(questions) : questions;
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags || [];

    const newQuiz = await Quiz.create({
      title,
      description,
      category,
      subcategory: subcategory || "",
      difficulty,
      timeLimit,
      questions: parsedQuestions,
      isPublic: isPublic === undefined ? true : (isPublic === "true" || isPublic === true),
      password: password || null,
      quizCode,
      quizImage,
      tags: parsedTags,
      createdBy: req.user._id,
      status: status || "draft",
    });

    await ActivityLog.create({
      user: req.user._id,
      activity: `Created quiz "${title}"`,
    });

    if (newQuiz.status === "published" && newQuiz.isPublic) {
      // Send global notification/activity if relevant (future)
      await Notification.create({
        user: req.user._id,
        title: "Quiz Published",
        message: `Your quiz "${title}" is now live!`,
        type: "quiz_published",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully.",
      data: newQuiz,
    });
  } catch (error) {
    console.error("[QuizController - createQuiz Error]:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Get all quizzes with pagination, search, and filtering
 * @route   GET /api/quizzes
 * @access  Public
 */
const getAllQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, subcategory, difficulty, sort } = req.query;

    const admins = await User.find({ role: "admin" }).select("_id");
    const adminIds = admins.map(a => a._id);

    const query = { status: "published" };
    const cleanSearch = search ? search.trim() : "";

    // Check if the search term is a valid MongoDB ObjectID or a 6-8 character alphanumeric Quiz ID
    const mongoose = require("mongoose");
    const isObjectId = mongoose.Types.ObjectId.isValid(cleanSearch);
    const isQuizCode = /^[a-zA-Z0-9]{6,8}$/.test(cleanSearch);

    if (isObjectId) {
      // Database ID search: search globally across all published quizzes
      query._id = cleanSearch;
    } else if (isQuizCode) {
      // Quiz ID search: search globally across all published quizzes
      query.quizCode = cleanSearch.toUpperCase();
    } else {
      // General search or browse: limit to default admin-created quizzes
      query.createdBy = { $in: adminIds };
      query.isPublic = true;

      if (cleanSearch) {
        const matchingCreators = await User.find({
          role: "admin",
          fullName: { $regex: cleanSearch, $options: "i" }
        }).select("_id");
        const creatorIds = matchingCreators.map(c => c._id);

        query.$or = [
          { title: { $regex: cleanSearch, $options: "i" } },
          { tags: { $regex: cleanSearch, $options: "i" } },
          { category: { $regex: cleanSearch, $options: "i" } },
          { subcategory: { $regex: cleanSearch, $options: "i" } }
        ];

        if (creatorIds.length > 0) {
          query.$or.push({ createdBy: { $in: creatorIds } });
        }
      }

      // Apply category, subcategory, difficulty filters
      if (category) {
        query.category = { $regex: new RegExp(`^${category}$`, "i") };
      }

      if (subcategory) {
        query.subcategory = { $regex: new RegExp(`^${subcategory}$`, "i") };
      }

      if (difficulty) {
        query.difficulty = difficulty;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let sortOption = { createdAt: -1 }; // default: latest
    if (sort === "trending") {
      sortOption = { attemptCount: -1 };
    } else if (sort === "popular") {
      sortOption = { averageScore: -1 };
    }

    const quizzes = await Quiz.find(query)
      .populate("createdBy", "fullName email username profileImage role")
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOption);

    const total = await Quiz.countDocuments(query);

    // Append average rating to quizzes on the fly
    const quizzesWithRatings = await Promise.all(
      quizzes.map(async (quiz) => {
        const ratingAggregate = await Rating.aggregate([
          { $match: { quiz: quiz._id } },
          { $group: { _id: null, avgRating: { $avg: "$rating" } } }
        ]);
        const quizObj = quiz.toObject();
        quizObj.averageRating = ratingAggregate.length > 0 ? Math.round(ratingAggregate[0].avgRating * 10) / 10 : 0;
        return quizObj;
      })
    );

    return res.status(200).json({
      success: true,
      message: "Quizzes retrieved successfully.",
      data: {
        quizzes: quizzesWithRatings,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("[QuizController - getAllQuizzes Error]:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Get a single quiz by ID (Hiding correct answers if user is not creator)
 * @route   GET /api/quizzes/:id
 * @access  Public
 */
const getQuizById = async (req, res) => {
  try {
    const idOrCode = req.params.id;
    let quiz;
    const mongoose = require("mongoose");
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrCode);
    
    if (isObjectId) {
      quiz = await Quiz.findById(idOrCode).populate("createdBy", "fullName email username profileImage");
    } else {
      quiz = await Quiz.findOne({ quizCode: idOrCode.toUpperCase() }).populate("createdBy", "fullName email username profileImage");
    }

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    const isCreator = req.user && quiz.createdBy._id.toString() === req.user._id.toString();

    // Restrict access to drafts
    if (quiz.status === "draft" && !isCreator) {
      return res.status(403).json({ success: false, message: "This quiz is a draft and can only be accessed by the creator." });
    }

    // Strip correct answers/explanations if the requester is not the creator
    const quizObj = quiz.toObject();

    if (!isCreator) {
      quizObj.questions = quizObj.questions.map((q) => {
        const questionClone = { ...q };
        delete questionClone.correctAnswer;
        delete questionClone.explanation;
        return questionClone;
      });
    }

    // Attach average rating
    const ratingAggregate = await Rating.aggregate([
      { $match: { quiz: quiz._id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, totalRatings: { $sum: 1 } } }
    ]);
    quizObj.averageRating = ratingAggregate.length > 0 ? Math.round(ratingAggregate[0].avgRating * 10) / 10 : 0;
    quizObj.totalRatings = ratingAggregate.length > 0 ? ratingAggregate[0].totalRatings : 0;

    // Check if bookmarked by req.user
    quizObj.isBookmarked = false;
    if (req.user) {
      const bookmark = await Bookmark.findOne({ user: req.user._id, quiz: quiz._id });
      quizObj.isBookmarked = !!bookmark;
    }

    return res.status(200).json({
      success: true,
      message: "Quiz retrieved successfully.",
      data: quizObj,
    });
  } catch (error) {
    console.error("[QuizController - getQuizById Error]:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Update a quiz (Only Creator)
 * @route   PUT /api/quizzes/:id
 * @access  Private
 */
const updateQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this quiz." });
    }

    const updateFields = { ...req.body };

    // Prevent changing ownership and quiz code
    delete updateFields.quizCode;
    delete updateFields.createdBy;

    if (req.file) {
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const uploadRes = await cloudinary.uploader.upload(dataUri, {
        folder: "quizzes",
        resource_type: "image",
      });
      updateFields.quizImage = uploadRes.secure_url;
    }

    if (updateFields.questions && typeof updateFields.questions === "string") {
      updateFields.questions = JSON.parse(updateFields.questions);
    }
    if (updateFields.tags && typeof updateFields.tags === "string") {
      updateFields.tags = JSON.parse(updateFields.tags);
    }

    // Apply updates directly to trigger pre-save hooks (like totalMarks calculation & isPublished setting)
    Object.assign(quiz, updateFields);
    const updatedQuiz = await quiz.save();

    await ActivityLog.create({
      user: req.user._id,
      activity: `Updated quiz "${quiz.title}"`,
    });

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully.",
      data: updatedQuiz,
    });
  } catch (error) {
    console.error("[QuizController - updateQuiz Error]:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Delete a quiz (Only Creator)
 * @route   DELETE /api/quizzes/:id
 * @access  Private
 */
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this quiz." });
    }

    const title = quiz.title;
    await Bookmark.deleteMany({ quiz: quiz._id });
    await Rating.deleteMany({ quiz: quiz._id });
    await Comment.deleteMany({ quiz: quiz._id });
    await quiz.deleteOne();

    await ActivityLog.create({
      user: req.user._id,
      activity: `Deleted quiz "${title}"`,
    });

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully.",
      data: {},
    });
  } catch (error) {
    console.error("[QuizController - deleteQuiz Error]:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Join a quiz via code
 * @route   POST /api/quizzes/join
 * @access  Private
 */
const joinQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { quizCode, password } = req.body;

    const quiz = await Quiz.findOne({ quizCode: quizCode.toUpperCase(), status: "published" });

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Invalid or inactive quiz code." });
    }

    if (!quiz.isPublic) {
      if (!password || password !== quiz.password) {
        return res.status(401).json({ success: false, message: "Incorrect or missing password for private quiz." });
      }
    }

    // Strip answers
    const quizObj = quiz.toObject();
    quizObj.questions = quizObj.questions.map((q) => {
      const questionClone = { ...q };
      delete questionClone.correctAnswer;
      delete questionClone.explanation;
      return questionClone;
    });

    return res.status(200).json({
      success: true,
      message: "Successfully joined quiz.",
      data: quizObj,
    });
  } catch (error) {
    console.error("[QuizController - joinQuiz Error]:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Get all quizzes created by the logged-in user
 * @route   GET /api/quizzes/my
 * @access  Private
 */
const getMyQuizzes = async (req, res) => {
  try {
    console.log("[getMyQuizzes DEBUG] User email:", req.user?.email, "ID:", req.user?._id);
    const quizzes = await Quiz.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    console.log("[getMyQuizzes DEBUG] Found quizzes count:", quizzes.length);

    return res.status(200).json({
      success: true,
      message: "Your quizzes retrieved successfully.",
      data: quizzes,
    });
  } catch (error) {
    console.error("[QuizController - getMyQuizzes Error]:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Bookmark a quiz
 * @route   POST /api/quizzes/:id/bookmark
 * @access  Private
 */
const bookmarkQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    await Bookmark.findOneAndUpdate(
      { user: req.user._id, quiz: quizId },
      {},
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, message: "Quiz bookmarked successfully." });
  } catch (error) {
    console.error("Bookmark Quiz Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Unbookmark a quiz
 * @route   DELETE /api/quizzes/:id/bookmark
 * @access  Private
 */
const unbookmarkQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    await Bookmark.deleteOne({ user: req.user._id, quiz: quizId });
    return res.status(200).json({ success: true, message: "Quiz unbookmarked successfully." });
  } catch (error) {
    console.error("Unbookmark Quiz Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Get bookmarked quizzes for the logged-in user
 * @route   GET /api/quizzes/bookmarked
 * @access  Private
 */
const getBookmarkedQuizzes = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).populate({
      path: "quiz",
      populate: { path: "createdBy", select: "fullName email username" }
    });
    const quizzes = bookmarks.map(b => b.quiz).filter(Boolean);
    return res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    console.error("Get Bookmarked Quizzes Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Rate a quiz (1 to 5 stars)
 * @route   POST /api/quizzes/:id/rate
 * @access  Private
 */
const rateQuiz = async (req, res) => {
  try {
    const { rating } = req.body;
    const quizId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    await Rating.findOneAndUpdate(
      { user: req.user._id, quiz: quizId },
      { rating },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, message: "Quiz rated successfully." });
  } catch (error) {
    console.error("Rate Quiz Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Add a comment or reply to a quiz
 * @route   POST /api/quizzes/:id/comment
 * @access  Private
 */
const addComment = async (req, res) => {
  try {
    const { text, parentComment } = req.body;
    const quizId = req.params.id;

    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text is required." });
    }

    const comment = await Comment.create({
      user: req.user._id,
      quiz: quizId,
      text,
      parentComment: parentComment || null,
    });

    const populated = await comment.populate("user", "fullName username profileImage");

    return res.status(201).json({ success: true, message: "Comment added.", data: populated });
  } catch (error) {
    console.error("Add Comment Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Get all comments for a quiz
 * @route   GET /api/quizzes/:id/comments
 * @access  Public
 */
const getQuizComments = async (req, res) => {
  try {
    const quizId = req.params.id;
    const comments = await Comment.find({ quiz: quizId })
      .populate("user", "fullName username profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error("Get Comments Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Delete a comment (Comment creator only)
 * @route   DELETE /api/quizzes/comments/:commentId
 * @access  Private
 */
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    return res.status(200).json({ success: true, message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
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
};