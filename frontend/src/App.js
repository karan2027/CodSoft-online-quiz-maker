import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CreateQuiz from "./pages/CreateQuiz";
import AllQuizzes from "./pages/AllQuizzes";
import Category from "./pages/Category";
import QuizAttempt from "./pages/QuizAttempt";
import Result from "./pages/Result";
import Leaderboard from "./pages/Leaderboard";
import History from "./pages/History";
import ProtectedRoute from "./components/ProtectedRoute";

import SubCategory from "./pages/SubCategory/SubCategory";
import QuizListing from "./pages/QuizListing/QuizListing";
import QuizDetails from "./pages/QuizDetails/QuizDetails";
import StaticPage from "./pages/StaticPage/StaticPage";
import About from "./pages/About/About";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions/TermsConditions";


function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<StaticPage title="Contact" />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/all-quizzes" element={<AllQuizzes />} />
      <Route path="/category" element={<Category />} />
      
      {/* Hierarchical Browsing */}
      <Route path="/subcategory/:categoryName" element={<SubCategory />} />
      <Route path="/quiz-list/:categoryName/:subcategoryName" element={<QuizListing />} />
      <Route path="/quiz-details/:quizId" element={<QuizDetails />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-quiz"
        element={
          <ProtectedRoute>
            <CreateQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-quiz/:quizId"
        element={
          <ProtectedRoute>
            <CreateQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:quizId"
        element={
          <ProtectedRoute>
            <QuizAttempt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/result/:attemptId"
        element={
          <ProtectedRoute>
            <Result />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard/:quizId"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      
      {/* Fallback 404 Route */}
      <Route
        path="*"
        element={
          <div style={{ padding: "8rem 2rem", textAlign: "center", background: "var(--color-bg)", color: "var(--color-text-main)" }}>
            <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>404</h1>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Page Not Found</h2>
            <p style={{ marginBottom: "2rem", color: "var(--color-text-muted)" }}>
              The page you are looking for does not exist or has been moved.
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                background: "var(--color-primary)",
                color: "white",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "bold"
              }}
            >
              Go to Homepage
            </a>
          </div>
        }
      />
    </Routes>
  );
}

export default App;