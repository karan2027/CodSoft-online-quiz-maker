import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

import { useAuth } from "../../context/AuthContext";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import SearchBar from "../../components/SearchBar";
import QuizCard from "../../components/QuizCard";
import * as quizService from "../../services/quizService";

import "./Home.css";

const capitalize = (value) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getCategoryStyle = (name) => {
  const styles = {
    "Programming": { color: "#4f46e5", bg: "#eef2ff", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> },
    "Web Development": { color: "#0284c7", bg: "#e0f2fe", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> },
    "Computer Science": { color: "#2563eb", bg: "#dbeafe", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg> },
    "Database": { color: "#16a34a", bg: "#dcfce7", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg> },
    "Mobile Development": { color: "#9333ea", bg: "#f3e8ff", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg> },
    "Artificial Intelligence": { color: "#db2777", bg: "#fce7f3", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 2.5 2.5 0 0 1-.21-4.82A2.5 2.5 0 0 1 5.5 7.5 2.5 2.5 0 0 1 9.5 2z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 2.5 2.5 0 0 0 .21-4.82 2.5 2.5 0 0 0-1.63-4.54A2.5 2.5 0 0 0 14.5 2z"></path></svg> },
    "Machine Learning": { color: "#0d9488", bg: "#ccfbf1", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> },
    "Data Science": { color: "#ea580c", bg: "#ffedd5", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg> },
    "Cyber Security": { color: "#10b981", bg: "#d1fae5", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> },
    "Cloud Computing": { color: "#0ea5e9", bg: "#e0f2fe", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg> },
    "DevOps": { color: "#8b5cf6", bg: "#ede9fe", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.153-8-12.356-8-5.095 0-5.095 8 0 8 5.203 0 7.261-8 12.356-8z"></path></svg> },
    "Aptitude": { color: "#f43f5e", bg: "#ffe4e6", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> }
  };
  return styles[name] || { color: "#4b5563", bg: "#f3f4f6", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg> };
};

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalQuizzesCount, setTotalQuizzesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [quizResult, categoryResult] = await Promise.all([
          quizService.getAllQuizzes({ limit: 6 }),
          api.get("/categories"),
        ]);

        if (quizResult.success && quizResult.data) {
          setQuizzes(quizResult.data.quizzes || []);
          setTotalQuizzesCount(quizResult.data.total || 0);
        }

        if (categoryResult.data.success) {
          setCategories(categoryResult.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      navigate(`/all-quizzes?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz-details/${quizId}`);
  };

  const statistics = [
    { label: "Available Quizzes", value: String(totalQuizzesCount) },
    { label: "Categories Offered", value: String(categories.length) },
  ];

  return (
    <>
      <Navbar />

      <main className="home">
        <section className="home-hero">
          <div className="home-hero__container">
            <div className="home-hero__content">
              <p className="home-hero__eyebrow">Online Quiz Maker</p>
              <h1>Create, share and attempt interactive quizzes.</h1>
              <p className="home-hero__description">
                Build powerful quizzes for learning, practice and assessment with a
                clean experience for students, teachers and quiz creators.
              </p>

              <div className="home-hero__actions">
                <Link to="/create-quiz">
                  <Button variant="primary" size="large">
                    Create Quiz
                  </Button>
                </Link>
                <Link to="/all-quizzes">
                  <Button variant="outline" size="large">
                    Explore Quizzes
                  </Button>
                </Link>
              </div>
            </div>

            <div className="home-hero__panel" aria-label="Quiz platform highlights">
              <div className="home-hero__panel-card">
                <span className="home-hero__panel-value">15 min</span>
                <span className="home-hero__panel-label">Avg. quiz time</span>
              </div>
              <div className="home-hero__panel-card">
                <span className="home-hero__panel-value">95%</span>
                <span className="home-hero__panel-label">Grading Accuracy</span>
              </div>
              <div className="home-hero__panel-card home-hero__panel-card--wide">
                <span className="home-hero__panel-value">Live results</span>
                <span className="home-hero__panel-label">
                  Track attempts, scores and quiz performance instantly.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="home-search section" aria-labelledby="search-title">
          <div className="container">
            <div className="home-section-heading">
              <p className="home-section-heading__eyebrow">Search</p>
              <h2 id="search-title">Find your next quiz</h2>
              <p>Search by quiz title, category, topic or skill level.</p>
            </div>

            <SearchBar
              placeholder="Search quizzes, categories or topics..."
              onSearch={handleSearch}
            />
          </div>
        </section>

        <section className="home-categories section" aria-labelledby="categories-title">
          <div className="container">
            <div className="home-section-heading" style={{ textAlign: "center", margin: "0 auto 3rem" }}>
              <h2 id="categories-title" style={{ fontSize: "2.5rem", marginBottom: "0.5rem", color: "#1e293b" }}>Browse Top Categories</h2>
              <p style={{ color: "#64748b", fontSize: "1.1rem", marginBottom: "1rem" }}>Choose a category to explore a wide range of quizzes</p>
              <div style={{ width: "60px", height: "4px", backgroundColor: "#2563eb", margin: "0 auto", borderRadius: "2px" }}></div>
            </div>

            <div className="home-categories__grid">
              {categories.map((category) => {
                const style = getCategoryStyle(category.name);
                return (
                  <Link 
                    key={category.name} 
                    to={`/subcategory/${encodeURIComponent(category.name)}`} 
                    className="home-category-card" 
                    style={{ textDecoration: "none", color: "inherit", textAlign: "center" }}
                  >
                    <article className="home-category-card__inner">
                      <div 
                        className="home-category-card__icon"
                        style={{ 
                          backgroundColor: style.bg, 
                          color: style.color,
                          width: "64px",
                          height: "64px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 1.5rem"
                        }}
                      >
                        {style.icon}
                      </div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1f2937" }}>
                        {category.name}
                      </h3>
                      <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                        {category.quizCount}+ Quizzes
                      </p>
                      <span style={{ color: "#2563eb", fontWeight: "600", fontSize: "0.9rem" }}>Explore &rarr;</span>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="home-quizzes section" aria-labelledby="featured-title">
          <div className="container">
            <div className="home-section-heading home-section-heading--split">
              <div>
                <p className="home-section-heading__eyebrow">Featured</p>
                <h2 id="featured-title">Featured quizzes</h2>
                <p>Popular quizzes selected for better learning and practice.</p>
              </div>
              <Link to="/all-quizzes" className="home-section-heading__link">
                View all
              </Link>
            </div>

            {loading ? (
              <p>Loading featured quizzes...</p>
            ) : quizzes.length === 0 ? (
              <p>No quizzes available yet. Create one to get started!</p>
            ) : (
              <div className="home-quiz-grid">
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz._id}
                    quizId={quiz._id}
                    title={quiz.title}
                    description={quiz.description}
                    category={quiz.category}
                    difficulty={capitalize(quiz.difficulty)}
                    totalQuestions={quiz.questions?.length || 0}
                    estimatedTime={`${quiz.timeLimit} min`}
                    createdBy={quiz.createdBy?.fullName || "Anonymous"}
                    totalAttempts={quiz.attemptCount || 0}
                    averageScore={quiz.averageScore || 0}
                    isPrivate={!quiz.isPublic}
                    passwordProtected={!quiz.isPublic}
                    onStartQuiz={handleStartQuiz}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="home-stats section" aria-labelledby="stats-title">
          <div className="container">
            <div className="home-section-heading">
              <p className="home-section-heading__eyebrow">Statistics</p>
              <h2 id="stats-title">Learning in numbers</h2>
              <p>Track progress, attempts and growing quiz activity.</p>
            </div>

            <div className="home-stats__grid">
              {statistics.map((stat) => (
                <article className="home-stat-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-cta section" aria-labelledby="cta-title">
  <div className="container">
    <div className="home-cta__content">
      {isAuthenticated ? (
        <>
          <p className="home-section-heading__eyebrow">Welcome Back</p>

          <h2 id="cta-title">Ready to create your next quiz?</h2>

          <p>
            Create new quizzes, manage existing ones and continue helping others
            learn through interactive quizzes.
          </p>

          <Link to="/create-quiz">
            <Button variant="primary" size="large">
              Create Quiz
            </Button>
          </Link>
        </>
      ) : (
        <>
          <p className="home-section-heading__eyebrow">Get Started</p>

          <h2 id="cta-title">Ready to create your first quiz?</h2>

          <p>
            Register now and start creating interactive quizzes for practice,
            assessment and knowledge sharing.
          </p>

          <Link to="/register">
            <Button variant="primary" size="large">
              Register Now
            </Button>
          </Link>
        </>
      )}
    </div>
  </div>
</section>

      </main>

      <Footer />
    </>
  );
}

export default Home;