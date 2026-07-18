import api from "./api";

// Matches the REAL backend contract:
//   GET    /api/quizzes            (query: page, limit, search, category, difficulty, isPublic)
//   GET    /api/quizzes/my
//   GET    /api/quizzes/:id
//   POST   /api/quizzes
//   PUT    /api/quizzes/:id
//   DELETE /api/quizzes/:id
//   POST   /api/quizzes/join       (body: quizCode, password)
//   POST   /api/results/submit     (body: quizId, answers, timeTaken)
//   GET    /api/results/my-results
//   GET    /api/results/:resultId
//
// NOTE: There is no dedicated "popular", "latest", "search", or "leaderboard"
// endpoint on the backend yet. Popular/latest are derived client-side from
// getAllQuizzes(). Leaderboard is not implemented on the backend (TODO there).

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || fallback;
};

// filters: { page, limit, search, category, difficulty, isPublic }
export const getAllQuizzes = async (filters = {}) => {
  try {
    const res = await api.get("/quizzes", { params: filters });
    // Backend returns: { quizzes, total, page, pages }
    return { success: true, message: res.data.message, data: res.data.data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Unable to fetch quizzes.") };
  }
};

export const getQuizById = async (quizId) => {
  try {
    const res = await api.get(`/quizzes/${quizId}`);
    return { success: true, message: res.data.message, data: res.data.data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Quiz not found.") };
  }
};

export const getMyQuizzes = async () => {
  try {
    const res = await api.get("/quizzes/my");
    return { success: true, message: res.data.message, data: res.data.data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Unable to fetch your quizzes.") };
  }
};

export const createQuiz = async (quizData) => {
  try {
    const res = await api.post("/quizzes", quizData);
    return { success: true, message: res.data.message, data: res.data.data };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Unable to create quiz."),
      errors: error?.response?.data?.errors,
    };
  }
};

export const updateQuiz = async (quizId, updatedData) => {
  try {
    const res = await api.put(`/quizzes/${quizId}`, updatedData);
    return { success: true, message: res.data.message, data: res.data.data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Unable to update quiz.") };
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    const res = await api.delete(`/quizzes/${quizId}`);
    return { success: true, message: res.data.message };
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Unable to delete quiz.") };
  }
};

export const joinQuiz = async (quizCode, password) => {
  try {
    const res = await api.post("/quizzes/join", { quizCode, password });
    return { success: true, message: res.data.message, data: res.data.data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Unable to join quiz.") };
  }
};

// answers: [{ questionId, selectedOption }], timeTaken: seconds (number)
export const submitQuiz = async (quizId, answers, timeTaken) => {
  try {
    const res = await api.post("/results/submit", { quizId, answers, timeTaken });
    return { success: true, message: res.data.message, data: res.data.data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Unable to submit quiz.") };
  }
};

export const getMyResults = async () => {
  try {
    const res = await api.get("/results/my-results");
    return { success: true, message: res.data.message, data: res.data.data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Unable to fetch your results.") };
  }
};

export const getResultById = async (resultId) => {
  try {
    const res = await api.get(`/results/${resultId}`);
    return { success: true, message: res.data.message, data: res.data.data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Result not found.") };
  }
};

export const getLeaderboard = async (quizId) => {
  try {
    const res = await api.get(`/results/leaderboard/${quizId}`);
    return { success: true, message: res.data.message, data: res.data.data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Unable to fetch leaderboard.") };
  }
};