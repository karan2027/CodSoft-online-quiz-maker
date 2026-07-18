import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import * as quizService from "../../services/quizService";

import "./QuizDetails.css";

const capitalize = (value) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

function QuizDetails() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      setLoading(true);
      const response = await quizService.getQuizById(quizId);
      if (response.success) {
        setQuiz(response.data);
      } else {
        setError(response.message);
      }
      setLoading(false);
    };

    fetchQuizDetails();
  }, [quizId]);

  const handleStartQuiz = () => {
    if (!isAuthenticated) {
      // Redirect to login, then come back to the protected quiz attempt route
      navigate("/login", { state: { from: { pathname: `/quiz/${quizId}` } } });
    } else {
      navigate(`/quiz/${quizId}`);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="quiz-details-page loading-state">
          <p>Loading Quiz Details...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !quiz) {
    return (
      <>
        <Navbar />
        <main className="quiz-details-page error-state">
          <h2>Oops!</h2>
          <p>{error || "Quiz not found."}</p>
          <Link to="/" className="back-link">Return to Home</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="quiz-details-page">
        <div className="container">
          <nav className="quiz-listing-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li><Link to={`/subcategory/${encodeURIComponent(quiz.category)}`}>{quiz.category}</Link></li>
              <li><Link to={`/quiz-list/${encodeURIComponent(quiz.category)}/${encodeURIComponent(quiz.subcategory)}`}>{quiz.subcategory}</Link></li>
              <li aria-current="page">Details</li>
            </ol>
          </nav>

          <div className="quiz-details-card">
            <div className="quiz-details-header">
              <h1>{quiz.title}</h1>
              <p className="quiz-details-desc">{quiz.description}</p>
            </div>

            <div className="quiz-details-grid">
              <div className="quiz-stat">
                <span>Category</span>
                <strong>{quiz.category}</strong>
              </div>
              <div className="quiz-stat">
                <span>Subcategory</span>
                <strong>{quiz.subcategory}</strong>
              </div>
              <div className="quiz-stat">
                <span>Difficulty</span>
                <strong>{capitalize(quiz.difficulty)}</strong>
              </div>
              <div className="quiz-stat">
                <span>Total Questions</span>
                <strong>{quiz.questions?.length || 0}</strong>
              </div>
              <div className="quiz-stat">
                <span>Estimated Time</span>
                <strong>{quiz.timeLimit} Minutes</strong>
              </div>
              <div className="quiz-stat">
                <span>Passing Percentage</span>
                <strong>{quiz.passingPercentage || 60}%</strong>
              </div>
              <div className="quiz-stat">
                <span>Created By</span>
                <strong>{quiz.createdBy?.fullName || "Anonymous"}</strong>
              </div>
              <div className="quiz-stat">
                <span>Created Date</span>
                <strong>{new Date(quiz.createdAt).toLocaleDateString()}</strong>
              </div>
            </div>

            <div className="quiz-details-actions">
              <Button variant="primary" size="large" onClick={handleStartQuiz}>
                Start Quiz
              </Button>
              <Link to={`/leaderboard/${quizId}`}>
                <Button variant="outline" size="large">
                  Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default QuizDetails;
