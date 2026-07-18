const Result = require("../models/Result");
const Quiz = require("../models/Quiz");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError, sendCreated } = require("../utils/response");

/**
 * @desc    Submit a quiz attempt and calculate score (supporting negative marking & rank calculation)
 * @route   POST /api/quizzes/:id/submit OR /api/results/submit
 * @access  Private
 */
const submitQuiz = asyncHandler(async (req, res) => {
  const quizId = req.params.id || req.body.quizId;
  const { answers, timeTaken } = req.body;
  const studentId = req.user._id;

  if (!quizId) {
    return sendError(res, 400, "Quiz ID is required.");
  }

  // 1. Find the quiz
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return sendError(res, 404, "Quiz not found.");
  }

  // 2. Validate quiz availability
  if (quiz.status !== "published") {
    return sendError(res, 403, "Cannot submit. This quiz is not published.");
  }

  const now = new Date();
  if (quiz.startDate && now < quiz.startDate) {
    return sendError(res, 403, "This quiz has not started yet.");
  }
  if (quiz.endDate && now > quiz.endDate) {
    return sendError(res, 403, "This quiz has already ended.");
  }

  // 3. Prevent duplicate submissions if not allowed
  if (!quiz.allowMultipleAttempts) {
    const existingResult = await Result.findOne({ quiz: quizId, student: studentId });
    if (existingResult) {
      return sendError(res, 400, "You have already submitted this quiz.");
    }
  }

  // 4. Grading Engine
  let rawScore = 0;
  const processedAnswers = [];

  const questionMap = new Map();
  quiz.questions.forEach((q) => {
    questionMap.set(q._id.toString(), q);
  });

  (answers || []).forEach((submittedAnswer) => {
    const question = questionMap.get(submittedAnswer.questionId);
    
    if (question) {
      const isCorrect = question.correctAnswer === submittedAnswer.selectedOption;
      let marksAwarded = 0;

      if (isCorrect) {
        marksAwarded = question.marks || 1;
        rawScore += marksAwarded;
      } else {
        const negativeMarks = question.negativeMarks || 0;
        marksAwarded = -negativeMarks;
        rawScore -= negativeMarks;
      }

      processedAnswers.push({
        questionId: question._id,
        selectedOption: submittedAnswer.selectedOption,
        isCorrect,
        marksAwarded,
      });
    }
  });

  // Cap final score at 0 to prevent negative total percentage
  const finalScore = Math.max(0, rawScore);

  // 5. Create Result Document
  const newResult = new Result({
    student: studentId,
    quiz: quizId,
    answers: processedAnswers,
    score: finalScore,
    totalMarks: quiz.totalMarks,
    timeTaken: timeTaken || 0,
    status: "completed",
    submittedAt: now,
  });

  await newResult.save();

  // 6. Update Quiz Statistics
  quiz.attemptCount += 1;
  
  if (finalScore > quiz.highestScore) {
    quiz.highestScore = finalScore;
  }

  // Recalculate rolling average score
  const previousTotalScore = quiz.averageScore * (quiz.attemptCount - 1);
  const newAverage = (previousTotalScore + finalScore) / quiz.attemptCount;
  quiz.averageScore = Math.round(newAverage * 100) / 100;

  await quiz.save();

  // 7. Calculate real-time rank
  const countBetterAttempts = await Result.countDocuments({
    quiz: quizId,
    status: "completed",
    $or: [
      { percentage: { $gt: newResult.percentage } },
      {
        percentage: newResult.percentage,
        timeTaken: { $lt: newResult.timeTaken }
      },
      {
        percentage: newResult.percentage,
        timeTaken: newResult.timeTaken,
        submittedAt: { $lt: newResult.submittedAt }
      }
    ]
  });

  const rank = countBetterAttempts + 1;

  // 8. Create logs and notifications
  await ActivityLog.create({
    user: studentId,
    activity: `Attempted quiz "${quiz.title}" with score ${finalScore}/${quiz.totalMarks}`,
  });

  await Notification.create({
    user: studentId,
    title: "Quiz Completed",
    message: `Your score for "${quiz.title}" is ${finalScore}/${quiz.totalMarks}. Rank: ${rank}`,
    type: "result_available",
  });

  return sendCreated(res, "Quiz submitted successfully and graded.", {
    resultId: newResult._id,
    score: newResult.score,
    totalMarks: newResult.totalMarks,
    percentage: newResult.percentage,
    timeTaken: newResult.timeTaken,
    rank,
  });
});

/**
 * @desc    Get all results/attempts for the logged-in user
 * @route   GET /api/results/my-results
 * @access  Private
 */
const getMyResults = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const results = await Result.find({ student: studentId })
    .sort({ submittedAt: -1 })
    .populate("quiz", "title category difficulty totalMarks timeLimit quizImage");

  return sendSuccess(res, 200, "Your results fetched successfully.", results);
});

/**
 * @desc    Get detailed view of a specific result (including answers and explanation reviews)
 * @route   GET /api/results/:resultId
 * @access  Private
 */
const getResultById = asyncHandler(async (req, res) => {
  const resultId = req.params.resultId;

  // Populate quiz and student
  const result = await Result.findById(resultId)
    .populate({
      path: "quiz",
      select: "title description category subcategory difficulty totalMarks questions timeLimit"
    })
    .populate("student", "fullName email username profileImage");

  if (!result) {
    return sendError(res, 404, "Result not found.");
  }

  // Security check: Only the quiz owner or attempt student can view detailed results
  const isStudent = result.student._id.toString() === req.user._id.toString();
  const isQuizOwner = result.quiz.createdBy && result.quiz.createdBy.toString() === req.user._id.toString();

  if (!isStudent && !isQuizOwner) {
    return sendError(res, 403, "You do not have permission to view this result.");
  }

  // Calculate rank for this result details
  const countBetterAttempts = await Result.countDocuments({
    quiz: result.quiz._id,
    status: "completed",
    $or: [
      { percentage: { $gt: result.percentage } },
      {
        percentage: result.percentage,
        timeTaken: { $lt: result.timeTaken }
      },
      {
        percentage: result.percentage,
        timeTaken: result.timeTaken,
        submittedAt: { $lt: result.submittedAt }
      }
    ]
  });

  const rank = countBetterAttempts + 1;
  const resultObj = result.toObject();
  resultObj.rank = rank;

  return sendSuccess(res, 200, "Result details fetched successfully.", resultObj);
});

/**
 * @desc    Get leaderboard (top scores) for a specific quiz (Top 10 + current user rank)
 * @route   GET /api/results/leaderboard/:quizId
 * @access  Private
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user ? req.user._id : null;

  // Resolve quiz ID if it is a quizCode
  const mongoose = require("mongoose");
  let realQuizId = quizId;
  let quizObj = null;

  if (mongoose.Types.ObjectId.isValid(quizId)) {
    quizObj = await Quiz.findById(quizId).select("createdBy");
  } else {
    quizObj = await Quiz.findOne({ quizCode: quizId.toUpperCase() }).select("_id createdBy");
    if (quizObj) {
      realQuizId = quizObj._id;
    }
  }

  // Check if the requester is the creator of the quiz
  const isCreator = userId && quizObj && quizObj.createdBy && quizObj.createdBy.toString() === userId.toString();

  // If creator, fetch all attempts (limit 1000). Otherwise, fetch top 10.
  const attemptsLimit = isCreator ? 1000 : 10;

  // Get top scores
  const topAttempts = await Result.find({ quiz: realQuizId, status: "completed" })
    .sort({ percentage: -1, timeTaken: 1, submittedAt: 1 })
    .limit(attemptsLimit)
    .populate("student", "fullName username email profileImage");

  // Format rank indices
  const leaderboard = topAttempts.map((attempt, index) => {
    const attemptObj = attempt.toObject();
    attemptObj.rank = index + 1;
    return attemptObj;
  });

  // Calculate student's personal rank if logged in
  let userRankInfo = null;
  if (userId) {
    const userBestAttempt = await Result.findOne({ quiz: realQuizId, student: userId, status: "completed" })
      .sort({ percentage: -1, timeTaken: 1, submittedAt: 1 });

    if (userBestAttempt) {
      const betterAttemptsCount = await Result.countDocuments({
        quiz: realQuizId,
        status: "completed",
        $or: [
          { percentage: { $gt: userBestAttempt.percentage } },
          {
            percentage: userBestAttempt.percentage,
            timeTaken: { $lt: userBestAttempt.timeTaken }
          },
          {
            percentage: userBestAttempt.percentage,
            timeTaken: userBestAttempt.timeTaken,
            submittedAt: { $lt: userBestAttempt.submittedAt }
          }
        ]
      });

      userRankInfo = userBestAttempt.toObject();
      userRankInfo.rank = betterAttemptsCount + 1;
    }
  }

  return sendSuccess(res, 200, "Leaderboard fetched successfully.", {
    leaderboard,
    userRank: userRankInfo,
  });
});

module.exports = {
  submitQuiz,
  getMyResults,
  getResultById,
  getLeaderboard,
};