import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import QuizCard from "../../components/QuizCard";
import { useAuth } from "../../context/AuthContext";
import { useQuiz } from "../../context/QuizContext";
import * as quizService from "../../services/quizService";

import "./Dashboard.css";

const capitalize = (value) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatTimeTaken = (seconds) => {
  if (!seconds && seconds !== 0) return "-";
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myResults, loadQuizHistory } = useQuiz();

  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    const fetchMyQuizzes = async () => {
      setLoadingQuizzes(true);
      const result = await quizService.getMyQuizzes();
      if (result.success) {
        setMyQuizzes(result.data || []);
      }
      setLoadingQuizzes(false);
    };

    fetchMyQuizzes();
    loadQuizHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const attempted = myResults.length;
    const highestScore = attempted
      ? Math.max(...myResults.map((result) => result.percentage || 0))
      : 0;
    const averageScore = attempted
      ? Math.round(
          myResults.reduce((sum, result) => sum + (result.percentage || 0), 0) / attempted
        )
      : 0;

    return [
      { label: "Total Quizzes Created", value: String(myQuizzes.length) },
      { label: "Total Quizzes Attempted", value: String(attempted) },
      { label: "Highest Score", value: `${Math.round(highestScore)}%` },
      { label: "Average Score", value: `${averageScore}%` },
    ];
  }, [myQuizzes, myResults]);

  const [activeTab, setActiveTab] = useState("published");

  const publishedQuizzes = myQuizzes.filter(q => q.status === "published");
  const draftQuizzes = myQuizzes.filter(q => q.status === "draft");

  const recentQuizzes = publishedQuizzes.slice(0, 4);

  const handlePublishDraft = async (quizId) => {
    setLoadingQuizzes(true);
    const result = await quizService.updateQuiz(quizId, { status: "published" });
    if (result.success) {
      const updated = await quizService.getMyQuizzes();
      if (updated.success) {
        setMyQuizzes(updated.data || []);
      }
    }
    setLoadingQuizzes(false);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      setLoadingQuizzes(true);
      const result = await quizService.deleteQuiz(quizId);
      if (result.success) {
        setMyQuizzes(prev => prev.filter(q => q._id !== quizId));
      }
      setLoadingQuizzes(false);
    }
  };

  const recentAttempts = myResults.slice(0, 4);

  return (
    <>
      <Navbar />

      <main className="dashboard">
        <section className="dashboard-hero" aria-labelledby="dashboard-title">
          <div className="container">
            <p className="dashboard-hero__eyebrow">Dashboard</p>
            <h1 id="dashboard-title">Welcome back, {user?.fullName || "there"}</h1>
            <p>
              Manage your quizzes, review recent attempts and continue learning from
              one clean workspace.
            </p>
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="dashboard-stats-title">
          <div className="container">
            <div className="dashboard-section__heading">
              <h2 id="dashboard-stats-title">Your activity</h2>
              <p>A quick snapshot of your quiz creation and attempt performance.</p>
            </div>

            <div className="dashboard-stats">
              {stats.map((stat) => (
                <article className="dashboard-stat-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="quick-actions-title">
          <div className="container">
            <div className="dashboard-section__heading">
              <h2 id="quick-actions-title">Quick actions</h2>
              <p>Jump directly into the most common tasks.</p>
            </div>

            <div className="dashboard-actions">
              <Link to="/create-quiz">
                <Button variant="primary" size="large" fullWidth>
                  Create Quiz
                </Button>
              </Link>

              <Link to="/all-quizzes">
                <Button variant="outline" size="large" fullWidth>
                  Browse Quizzes
                </Button>
              </Link>

              <Link to="/history">
                <Button variant="secondary" size="large" fullWidth>
                  View History
                </Button>
              </Link>

              <Link to="/profile">
                <Button variant="outline" size="large" fullWidth>
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="recent-quizzes-title">
          <div className="container">
            <div className="dashboard-section__heading dashboard-section__heading--split">
              <div>
                <h2 id="recent-quizzes-title">My quizzes</h2>
                <p>Manage your drafts and published quizzes.</p>
              </div>
              <Link to="/all-quizzes" className="dashboard-section__link">
                View all quizzes
              </Link>
            </div>

            <div className="dashboard-tabs" style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
              <button 
                type="button" 
                style={{ 
                  background: "none", 
                  border: "none", 
                  fontSize: "1.1rem", 
                  fontWeight: "bold", 
                  color: activeTab === "published" ? "var(--color-primary)" : "var(--color-text-muted)", 
                  borderBottom: activeTab === "published" ? "3px solid var(--color-primary)" : "none",
                  paddingBottom: "0.5rem",
                  cursor: "pointer"
                }}
                onClick={() => setActiveTab("published")}
              >
                Published Quizzes ({publishedQuizzes.length})
              </button>
              <button 
                type="button" 
                style={{ 
                  background: "none", 
                  border: "none", 
                  fontSize: "1.1rem", 
                  fontWeight: "bold", 
                  color: activeTab === "drafts" ? "var(--color-primary)" : "var(--color-text-muted)", 
                  borderBottom: activeTab === "drafts" ? "3px solid var(--color-primary)" : "none",
                  paddingBottom: "0.5rem",
                  cursor: "pointer"
                }}
                onClick={() => setActiveTab("drafts")}
              >
                My Drafts ({draftQuizzes.length})
              </button>
            </div>

            {loadingQuizzes ? (
              <p>Loading your quizzes...</p>
            ) : activeTab === "published" ? (
              recentQuizzes.length === 0 ? (
                <p>You haven&apos;t published any quizzes yet. Click "Create Quiz" and publish one!</p>
              ) : (
                <div className="dashboard-quiz-grid">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz._id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <QuizCard
                        quizId={quiz._id}
                        quizCode={quiz.quizCode}
                        title={quiz.title}
                        description={quiz.description}
                        category={quiz.category}
                        difficulty={capitalize(quiz.difficulty)}
                        totalQuestions={quiz.questions?.length || 0}
                        estimatedTime={`${quiz.timeLimit} min`}
                        createdBy={user?.fullName || "You"}
                        totalAttempts={quiz.attemptCount || 0}
                        averageScore={quiz.averageScore || 0}
                        isPrivate={!quiz.isPublic}
                        passwordProtected={!quiz.isPublic}
                        actionText="Leaderboard"
                        onAction={(code) => navigate(`/leaderboard/${code}`)}
                      />
                      <div style={{ display: "flex", gap: "0.5rem", padding: "0 0.5rem" }}>
                        <Button variant="outline" size="small" onClick={() => navigate(`/edit-quiz/${quiz._id}`)} fullWidth>Edit</Button>
                        <Button variant="danger" size="small" onClick={() => handleDeleteQuiz(quiz._id)} fullWidth>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              draftQuizzes.length === 0 ? (
                <p>No drafts found. You can save a quiz as a draft from the "Create Quiz" page.</p>
              ) : (
                <div className="dashboard-quiz-grid">
                  {draftQuizzes.map((quiz) => (
                    <div className="dashboard-draft-card" key={quiz._id} style={{ border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.5rem", background: "var(--color-surface)", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                      <div>
                        <h3 style={{ fontSize: "1.2rem", color: "var(--color-text-main)", marginBottom: "0.5rem" }}>{quiz.title}</h3>
                        <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", marginBottom: "1rem", lineBreak: "anywhere" }}>{quiz.description || "No description provided."}</p>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                          <span style={{ fontSize: "0.8rem", background: "var(--color-bg)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>{quiz.category}</span>
                          <span style={{ fontSize: "0.8rem", background: "var(--color-bg)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>{capitalize(quiz.difficulty)}</span>
                          <span style={{ fontSize: "0.8rem", background: "var(--color-bg)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>{quiz.questions?.length || 0} Qs</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                        <Button variant="outline" size="small" onClick={() => navigate(`/edit-quiz/${quiz._id}`)} fullWidth>Edit</Button>
                        <Button variant="primary" size="small" onClick={() => handlePublishDraft(quiz._id)} fullWidth>Publish</Button>
                        <Button variant="danger" size="small" onClick={() => handleDeleteQuiz(quiz._id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="recent-attempts-title">
          <div className="container">
            <div className="dashboard-section__heading">
              <h2 id="recent-attempts-title">Recent attempts</h2>
              <p>Your latest quiz attempts and results.</p>
            </div>

            <div className="dashboard-table-card">
              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th scope="col">Quiz Title</th>
                      <th scope="col">Score</th>
                      <th scope="col">Time Taken</th>
                      <th scope="col">Date</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttempts.length === 0 ? (
                      <tr>
                        <td colSpan={5}>No quiz attempts yet.</td>
                      </tr>
                    ) : (
                      recentAttempts.map((attempt) => (
                        <tr key={attempt._id}>
                          <td>
                            <Link to={`/result/${attempt._id}`} style={{ textDecoration: "none", color: "var(--color-primary)", fontWeight: "bold" }}>
                              {attempt.quiz?.title || "Untitled Quiz"}
                            </Link>
                          </td>
                          <td>{Math.round(attempt.percentage || 0)}%</td>
                          <td>{formatTimeTaken(attempt.timeTaken)}</td>
                          <td>{formatDate(attempt.submittedAt)}</td>
                          <td>
                            <span
                              className={`dashboard-table__result dashboard-table__result--${attempt.status}`}
                            >
                              {capitalize(attempt.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Dashboard;