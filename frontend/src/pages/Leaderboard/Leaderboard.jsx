import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import * as quizService from "../../services/quizService";

import "./Leaderboard.css";

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
}

function Leaderboard() {
  const { quizId } = useParams();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [entries, setEntries] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const [quizResponse, leaderboardResponse] = await Promise.all([
        quizService.getQuizById(quizId),
        quizService.getLeaderboard(quizId),
      ]);

      if (quizResponse.success) {
        setQuiz(quizResponse.data);
      }

      if (leaderboardResponse.success) {
        setEntries(leaderboardResponse.data?.leaderboard || []);
        setUserRank(leaderboardResponse.data?.userRank || null);
      } else {
        setError(leaderboardResponse.message);
      }

      setLoading(false);
    };

    if (quizId) {
      load();
    }
  }, [quizId]);

  return (
    <>
      <Navbar />

      <main className="leaderboard-page">
        <section className="leaderboard-hero" aria-labelledby="leaderboard-page-title">
          <div className="container">
            <p className="leaderboard-hero__eyebrow">Leaderboard</p>
            <h1 id="leaderboard-page-title">{quiz?.title || "Quiz Leaderboard"}</h1>
            {quiz ? (
              <div className="leaderboard-hero__meta" aria-label="Quiz details">
                <span>{quiz.category}</span>
                <span>{quiz.difficulty}</span>
                <span>{quiz.questions?.length || 0} Questions</span>
              </div>
            ) : null}
          </div>
        </section>

        <section className="leaderboard-section section">
          <div className="container">
            {loading ? (
              <p>Loading leaderboard...</p>
            ) : error ? (
              <p role="alert" className="leaderboard-error">
                {error}
              </p>
            ) : entries.length === 0 ? (
              <p className="leaderboard-empty">
                No one has attempted this quiz yet. Be the first!
              </p>
            ) : (
              <div className="leaderboard-table-card">
                <div className="leaderboard-table-wrapper">
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th scope="col">Rank</th>
                        <th scope="col">Student</th>
                        <th scope="col">Score</th>
                        <th scope="col">Percentage</th>
                        <th scope="col">Time Taken</th>
                        <th scope="col">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, index) => {
                        const isCurrentUser = user && entry.student?._id === user._id;
                        return (
                          <tr
                            key={entry._id}
                            className={
                              isCurrentUser
                                ? "leaderboard-row leaderboard-row--current"
                                : "leaderboard-row"
                            }
                          >
                            <td>{index + 1}</td>
                            <td>{entry.student?.fullName || "Anonymous"}</td>
                            <td>
                              {entry.score} / {entry.totalMarks}
                            </td>
                            <td>{Math.round(entry.percentage)}%</td>
                            <td>{formatTime(entry.timeTaken)}</td>
                            <td>{formatDate(entry.submittedAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!loading && userRank && userRank.rank > 10 ? (
              <div className="leaderboard-user-rank">
                <p>
                  Your rank: <strong>#{userRank.rank}</strong> — {Math.round(userRank.percentage)}%
                  (not in the top 10 shown above)
                </p>
              </div>
            ) : null}

            <div className="leaderboard-actions">
              {quiz?._id ? (
                <Link to={`/quiz/${quiz._id}`}>
                  <Button variant="primary" size="large">
                    Attempt This Quiz
                  </Button>
                </Link>
              ) : null}
              <Link to="/all-quizzes">
                <Button variant="outline" size="large">
                  Browse More Quizzes
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

export default Leaderboard;
