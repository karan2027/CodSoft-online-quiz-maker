import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as quizService from "../services/quizService";

export const QuizContext = createContext(null);

export const QuizProvider = ({ children }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedCategory, setSelectedCategoryState] = useState(null);
  const [selectedDifficulty, setSelectedDifficultyState] = useState("");
  const [searchQuery, setSearchQueryState] = useState("");

  // Quiz attempt states
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(0);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Quiz grading states
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [unansweredQuestions, setUnansweredQuestions] = useState(0);

  // Leaderboard & History
  const [leaderboard, setLeaderboard] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);

  // Derive categories from current list of quizzes or defaults
  const categories = useMemo(() => {
    const defaultCategories = [
      { id: "programming", name: "Programming" },
      { id: "science", name: "Science" },
      { id: "general-knowledge", name: "General Knowledge" },
    ];
    const uniqueNames = Array.from(new Set(quizzes.map((q) => q.category).filter(Boolean)));
    const derived = uniqueNames.map((name) => ({
      id: name,
      name: name,
    }));
    const allCategories = [...defaultCategories, ...derived];
    const uniqueMap = {};
    allCategories.forEach((cat) => {
      uniqueMap[cat.id.toLowerCase()] = cat;
    });
    return Object.values(uniqueMap);
  }, [quizzes]);

  // Derived question fields
  const currentQuestion = useMemo(() => {
    return selectedQuiz?.questions?.[currentQuestionIndex] || null;
  }, [selectedQuiz, currentQuestionIndex]);

  const totalQuestions = useMemo(() => {
    return selectedQuiz?.questions?.length || 0;
  }, [selectedQuiz]);

  const filteredSubCategories = useMemo(() => {
    return [];
  }, []);

  const filteredQuizzes = useMemo(() => {
    return quizzes;
  }, [quizzes]);

  // Fetch quizzes with filters
  const fetchQuizzes = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const mergedFilters = {
        page: filters.page !== undefined ? filters.page : 1,
        limit: filters.limit !== undefined ? filters.limit : 10,
        search: filters.search !== undefined ? filters.search : searchQuery,
        category: filters.category !== undefined ? (filters.category === "all" ? undefined : filters.category) : (selectedCategory || undefined),
        difficulty: filters.difficulty !== undefined ? (filters.difficulty === "all" ? "" : filters.difficulty) : (selectedDifficulty || undefined),
        isPublic: filters.isPublic,
      };

      const result = await quizService.getAllQuizzes(mergedFilters);
      if (result.success && result.data) {
        setQuizzes(result.data.quizzes || []);
        setTotal(result.data.total || 0);
        setPage(result.data.page || 1);
        setPages(result.data.pages || 1);
      } else {
        setError(result.message || "Failed to fetch quizzes.");
      }
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  // Filter setters
  const setSelectedCategory = useCallback((category) => {
    setSelectedCategoryState(category || null);
  }, []);

  const setSelectedDifficulty = useCallback((difficulty) => {
    setSelectedDifficultyState(difficulty || "");
  }, []);

  const setSearchQuery = useCallback((query) => {
    setSearchQueryState(query || "");
  }, []);

  // Fetch automatically when filters change
  useEffect(() => {
    fetchQuizzes({ page: 1 });
  }, [selectedCategory, selectedDifficulty, searchQuery, fetchQuizzes]);

  // Load a single quiz by MongoDB ID
  const loadQuiz = useCallback(async (quizId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await quizService.getQuizById(quizId);
      if (result.success && result.data) {
        setSelectedQuiz(result.data);
        setTimer((result.data.timeLimit || 10) * 60);
        return { success: true, quiz: result.data };
      } else {
        setError(result.message || "Failed to load quiz.");
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError(err.message || "An error occurred.");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Start a quiz attempt
  const startQuiz = useCallback(
    (quiz = selectedQuiz) => {
      setLoading(true);
      setError(null);
      try {
        if (!quiz) {
          throw new Error("No quiz selected to start.");
        }
        setSelectedQuiz(quiz);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setScore(0);
        setCorrectAnswers(0);
        setWrongAnswers(0);
        setUnansweredQuestions(0);
        setTimer((quiz.timeLimit || 10) * 60);
        setIsQuizStarted(true);
        setIsQuizCompleted(false);
        return { success: true, quiz };
      } catch (err) {
        setError(err.message);
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [selectedQuiz]
  );

  // Navigate questions
  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      const maxIndex = Math.max(totalQuestions - 1, 0);
      return prev < maxIndex ? prev + 1 : prev;
    });
  }, [totalQuestions]);

  const previousQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToQuestion = useCallback(
    (index) => {
      if (index >= 0 && index < totalQuestions) {
        setCurrentQuestionIndex(index);
        return true;
      }
      return false;
    },
    [totalQuestions]
  );

  // Select option index for a question
  const selectAnswer = useCallback(
    (questionId, optionIndex) => {
      if (!isQuizStarted || isQuizCompleted) {
        setError("Quiz attempt is not active.");
        return false;
      }
      setAnswers((prev) => ({
        ...prev,
        [questionId]: optionIndex,
      }));
      return true;
    },
    [isQuizStarted, isQuizCompleted]
  );

  // Submit quiz attempt to backend
  const submitQuiz = useCallback(
    async (timeTaken) => {
      setLoading(true);
      setError(null);
      try {
        if (!selectedQuiz) {
          throw new Error("No active quiz selected.");
        }
        const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        }));

        const result = await quizService.submitQuiz(selectedQuiz._id, formattedAnswers, timeTaken);
        if (result.success && result.data) {
          setIsQuizCompleted(true);
          setIsQuizStarted(false);
          setScore(result.data.score || 0);
          return { success: true, data: result.data };
        } else {
          setError(result.message || "Failed to submit quiz.");
          return { success: false, message: result.message };
        }
      } catch (err) {
        setError(err.message || "An error occurred during submission.");
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [selectedQuiz, answers]
  );

  // Reset attempt
  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setUnansweredQuestions(0);
    setTimer(selectedQuiz ? (selectedQuiz.timeLimit || 10) * 60 : 0);
    setIsQuizStarted(false);
    setIsQuizCompleted(false);
    setError(null);
  }, [selectedQuiz]);

  // Update countdown timer
  const updateTimer = useCallback((value) => {
    setTimer((prev) => {
      if (typeof value === "function") {
        return Math.max(0, value(prev));
      }
      return Math.max(0, Number(value) || 0);
    });
  }, []);

  // Create new quiz
  const createQuiz = useCallback(
    async (quizData) => {
      setLoading(true);
      setError(null);
      try {
        const result = await quizService.createQuiz(quizData);
        if (result.success) {
          fetchQuizzes({ page: 1 });
          return { success: true, data: result.data };
        } else {
          setError(result.message || "Failed to create quiz.");
          return { success: false, message: result.message, errors: result.errors };
        }
      } catch (err) {
        setError(err.message || "An error occurred.");
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchQuizzes]
  );

  // Load attempt results/history
  const loadQuizHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await quizService.getMyResults();
      if (result.success && result.data) {
        setMyResults(result.data);
        setQuizHistory(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.message || "Failed to fetch quiz history.");
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError(err.message || "An error occurred.");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load leaderboard
  const loadLeaderboard = useCallback(async (quizId) => {
    if (!quizId) return { success: false, message: "Quiz ID is required." };
    setLoading(true);
    setError(null);
    try {
      const result = await quizService.getLeaderboard(quizId);
      if (result.success && result.data) {
        setLeaderboard(result.data.leaderboard || []);
        return { success: true, data: result.data };
      } else {
        setError(result.message || "Failed to fetch leaderboard.");
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError(err.message || "An error occurred.");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      quizzes,
      filteredQuizzes,
      total,
      page,
      pages,
      categories,
      filteredSubCategories,
      selectedCategory,
      selectedDifficulty,
      searchQuery,
      loading,
      error,
      myResults,
      selectedQuiz,
      currentQuestionIndex,
      currentQuestion,
      answers,
      score,
      correctAnswers,
      wrongAnswers,
      unansweredQuestions,
      totalQuestions,
      timer,
      isQuizStarted,
      isQuizCompleted,
      leaderboard,
      quizHistory,
      fetchQuizzes,
      setSelectedCategory,
      setSelectedDifficulty,
      setSearchQuery,
      loadQuiz,
      startQuiz,
      nextQuestion,
      previousQuestion,
      goToQuestion,
      selectAnswer,
      submitQuiz,
      resetQuiz,
      updateTimer,
      loadQuizHistory,
      loadLeaderboard,
      createQuiz,
    }),
    [
      quizzes,
      filteredQuizzes,
      total,
      page,
      pages,
      categories,
      filteredSubCategories,
      selectedCategory,
      selectedDifficulty,
      searchQuery,
      loading,
      error,
      myResults,
      selectedQuiz,
      currentQuestionIndex,
      currentQuestion,
      answers,
      score,
      correctAnswers,
      wrongAnswers,
      unansweredQuestions,
      totalQuestions,
      timer,
      isQuizStarted,
      isQuizCompleted,
      leaderboard,
      quizHistory,
      fetchQuizzes,
      setSelectedCategory,
      setSelectedDifficulty,
      setSearchQuery,
      loadQuiz,
      startQuiz,
      nextQuestion,
      previousQuestion,
      goToQuestion,
      selectAnswer,
      submitQuiz,
      resetQuiz,
      updateTimer,
      loadQuizHistory,
      loadLeaderboard,
      createQuiz,
    ]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};