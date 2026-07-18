import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import * as quizService from "../../services/quizService";

import "./Result.css";

const OPTION_LABELS = ["A", "B", "C", "D"];

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Result() {
  const { attemptId } = useParams();

  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const resultResponse = await quizService.getResultById(attemptId);

      if (!resultResponse.success) {
        setError(resultResponse.message);
        setLoading(false);
        return;
      }

      setResult(resultResponse.data);
      if (resultResponse.data.quiz) {
        setQuiz(resultResponse.data.quiz);
      }

      const quizId = resultResponse.data.quiz?._id || resultResponse.data.quiz;
      if (quizId) {
        // Fetch leaderboard details
        setLoadingLeaderboard(true);
        const leaderboardResponse = await quizService.getLeaderboard(quizId);
        if (leaderboardResponse.success) {
          // Backend returns { leaderboard: [...], userRank: {...} }, not a bare array
          setLeaderboard(leaderboardResponse.data?.leaderboard || []);
        }
        setLoadingLeaderboard(false);
      }

      setLoading(false);
    };

    if (attemptId) {
      load();
    }
  }, [attemptId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="result-page">
          <div className="container">
            <p>Loading result...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !result) {
    return (
      <>
        <Navbar />
        <main className="result-page">
          <div className="container">
            <p role="alert">{error || "Result not found."}</p>
            <Link to="/all-quizzes">
              <Button variant="primary">Browse Quizzes</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const passingPercentage = 60;
  const isPassed = result.percentage >= passingPercentage;

  const correctAnswers = result.answers.filter((a) => a.isCorrect).length;
  const wrongAnswers = result.answers.filter((a) => !a.isCorrect).length;
  const totalQuestions = quiz?.questions?.length || result.answers.length;
  const notAttempted = totalQuestions - result.answers.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Navbar />

      <main className="result-page">
        <section className="result-hero" aria-labelledby="result-title">
          <div className="container">
            <p className="result-hero__eyebrow">Quiz Result</p>
            <h1 id="result-title">{result.quiz?.title || "Quiz Result"}</h1>

            <div className="result-hero__meta" aria-label="Quiz result details">
              <span>{result.quiz?.category}</span>
              <span>{result.quiz?.difficulty}</span>
              <span>{isPassed ? "Pass" : "Fail"}</span>
            </div>
          </div>
        </section>

        <section className="result-section" aria-labelledby="leaderboard-title">
          <div className="container">
            <div className="result-section-heading">
              <h2 id="leaderboard-title">Leaderboard</h2>
              <p>Top 10 scores for this quiz attempt.</p>
            </div>

            {loadingLeaderboard ? (
              <p>Loading leaderboard...</p>
            ) : leaderboard.length === 0 ? (
              <p>No leaderboard scores recorded for this quiz yet.</p>
            ) : (
              <div className="leaderboard-table-card" style={{ marginTop: "1.5rem", background: "var(--color-surface)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
                <div className="history-table-wrapper" style={{ overflowX: "auto" }}>
                  <table className="history-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th scope="col" style={{ textAlign: "left", padding: "12px" }}>Rank</th>
                        <th scope="col" style={{ textAlign: "left", padding: "12px" }}>Student</th>
                        <th scope="col" style={{ textAlign: "left", padding: "12px" }}>Score</th>
                        <th scope="col" style={{ textAlign: "left", padding: "12px" }}>Percentage</th>
                        <th scope="col" style={{ textAlign: "left", padding: "12px" }}>Time Taken</th>
                        <th scope="col" style={{ textAlign: "left", padding: "12px" }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, index) => {
                        const isCurrentUserEntry = entry.student?._id === result.student?._id;
                        return (
                          <tr 
                            key={entry._id} 
                            style={{ 
                                  background: isCurrentUserEntry ? "rgba(76, 175, 80, 0.1)" : "transparent",
                                  fontWeight: isCurrentUserEntry ? "bold" : "normal"
                                }}
                              >
                                <td style={{ padding: "12px" }}>{index + 1}</td>
                                <td style={{ padding: "12px" }}>{entry.student?.fullName || "Anonymous Student"}</td>
                                <td style={{ padding: "12px" }}>{entry.score} / {entry.totalMarks}</td>
                                <td style={{ padding: "12px" }}>{Math.round(entry.percentage)}%</td>
                                <td style={{ padding: "12px" }}>{formatTime(entry.timeTaken)}</td>
                                <td style={{ padding: "12px" }}>{formatDate(entry.submittedAt)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </section>
    
            <section
              className="result-section result-section--surface"
              aria-labelledby="performance-title"
            >
              <div className="container">
                <div className="result-section-heading">
                  <h2 id="performance-title">Your Performance</h2>
                  <p>A summary of your quiz attempt.</p>
                </div>
    
                <div className="result-performance-card">
                  <article>
                    <strong>{result.score}</strong>
                    <span>Final Score</span>
                  </article>
                  <article>
                    <strong>{result.percentage}%</strong>
                    <span>Percentage</span>
                  </article>
                  <article>
                    <strong>{correctAnswers}</strong>
                    <span>Correct Answers</span>
                  </article>
                  <article>
                    <strong>{wrongAnswers}</strong>
                    <span>Wrong Answers</span>
                  </article>
                  <article>
                    <strong>{notAttempted}</strong>
                    <span>Not Attempted</span>
                  </article>
                  <article>
                    <strong>{totalQuestions}</strong>
                    <span>Total Questions</span>
                  </article>
                  <article>
                    <strong>{formatTime(result.timeTaken)}</strong>
                    <span>Time Taken</span>
                  </article>
                  <article
                    className={
                      isPassed ? "result-status result-status--pass" : "result-status result-status--fail"
                    }
                  >
                    <strong>{isPassed ? "Pass" : "Fail"}</strong>
                    <span>Status</span>
                  </article>
                </div>
              </div>
            </section>
    
            {quiz ? (
              <section className="result-section" aria-labelledby="review-title">
                <div className="container">
                  <div className="result-section-heading">
                    <h2 id="review-title">Question Review</h2>
                    <p>Review your selected answers and the correct answers.</p>
                  </div>
    
                  <div className="result-review-list">
                    {quiz.questions.map((question, index) => {
                      const submittedAnswer = result.answers.find(
                        (a) => a.questionId === question._id
                      );
                      const status = !submittedAnswer
                        ? "not-attempted"
                        : submittedAnswer.isCorrect
                          ? "correct"
                          : "wrong";
    
                      return (
                        <article
                          className={`result-review-card result-review-card--${status}`}
                          key={question._id}
                        >
                          <div className="result-review-card__header">
                            <span>Question {index + 1}</span>
                            <strong>
                              {status === "correct"
                                ? "Correct"
                                : status === "wrong"
                                  ? "Wrong"
                                  : "Not Attempted"}
                            </strong>
                          </div>
    
                          <h3>{question.questionText}</h3>
    
                          <ul className="result-review-card__options">
                            {question.options.map((option, optionIndex) => (
                              <li
                                key={optionIndex}
                                className={
                                  optionIndex === question.correctAnswer
                                    ? "result-review-card__option result-review-card__option--correct"
                                    : submittedAnswer && optionIndex === submittedAnswer.selectedOption
                                      ? "result-review-card__option result-review-card__option--selected"
                                      : "result-review-card__option"
                                }
                              >
                                {OPTION_LABELS[optionIndex]}. {option}
                              </li>
                            ))}
                          </ul>
    
                          <div className="result-review-card__answers">
                            <p>
                              Your Answer:{" "}
                              <strong>
                                {submittedAnswer
                                  ? `${OPTION_LABELS[submittedAnswer.selectedOption]}. ${
                                      question.options[submittedAnswer.selectedOption]
                                    }`
                                  : "Not Attempted"}
                              </strong>
                            </p>
                            <p>
                              Correct Answer:{" "}
                              <strong>
                                {OPTION_LABELS[question.correctAnswer]}.{" "}
                                {question.options[question.correctAnswer]}
                              </strong>
                            </p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
            ) : null}
    
            <section className="result-actions-section">
              <div className="container">
                <div className="result-actions">
                  {result.quiz?._id ? (
                    <Link to={`/quiz/${result.quiz._id}`}>
                      <Button variant="primary" size="large" fullWidth>
                        Retake Quiz
                      </Button>
                    </Link>
                  ) : null}
                  <Button variant="outline" size="large" onClick={handlePrint} fullWidth>
                    Download PDF Report
                  </Button>
                  <Link to="/all-quizzes">
                    <Button variant="outline" size="large" fullWidth>
                      Browse More Quizzes
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="secondary" size="large" fullWidth>
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </main>

      <Footer />
    </>
  );
}

export default Result;
