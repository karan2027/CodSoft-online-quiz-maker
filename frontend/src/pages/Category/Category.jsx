import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchBar from "../../components/SearchBar";
import { useQuiz } from "../../context/QuizContext";

import "./Category.css";

/* ── SVG icon + color mapping (same as Homepage) ───────────────── */
const getCategoryStyle = (name) => {
  const styles = {
    "Programming": { color: "#4f46e5", bg: "#eef2ff", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> },
    "Web Development": { color: "#0284c7", bg: "#e0f2fe", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> },
    "Computer Science": { color: "#2563eb", bg: "#dbeafe", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg> },
    "Database": { color: "#16a34a", bg: "#dcfce7", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg> },
    "Mobile Development": { color: "#9333ea", bg: "#f3e8ff", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg> },
    "Artificial Intelligence": { color: "#db2777", bg: "#fce7f3", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 2.5 2.5 0 0 1-.21-4.82A2.5 2.5 0 0 1 5.5 7.5 2.5 2.5 0 0 1 9.5 2z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 2.5 2.5 0 0 0 .21-4.82 2.5 2.5 0 0 0-1.63-4.54A2.5 2.5 0 0 0 14.5 2z"></path></svg> },
    "Machine Learning": { color: "#0d9488", bg: "#ccfbf1", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> },
    "Data Science": { color: "#ea580c", bg: "#ffedd5", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg> },
    "Cyber Security": { color: "#10b981", bg: "#d1fae5", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> },
    "Cloud Computing": { color: "#0ea5e9", bg: "#e0f2fe", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg> },
    "DevOps": { color: "#8b5cf6", bg: "#ede9fe", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.153-8-12.356-8-5.095 0-5.095 8 0 8 5.203 0 7.261-8 12.356-8z"></path></svg> },
    "Aptitude": { color: "#f43f5e", bg: "#ffe4e6", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> },
    "Interview Preparation": { color: "#d97706", bg: "#fef3c7", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg> },
    "General Knowledge": { color: "#6366f1", bg: "#e0e7ff", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> },
    "Science": { color: "#0891b2", bg: "#cffafe", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path></svg> },
  };
  return styles[name] || { color: "#4b5563", bg: "#f3f4f6", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg> };
};

function Category() {
  const navigate = useNavigate();
  const { setSearchQuery } = useQuiz();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        if (res.data.success) {
          setCategories(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const handleSearch = (searchTerm) => {
    setSearchQuery(searchTerm);
    navigate("/all-quizzes");
  };

  return (
    <>
      <Navbar />

      <main className="category-page">
        {/* ── Hero Section ──────────────────────────────── */}
        <section className="category-hero" aria-labelledby="category-title">
          <div className="container">
            <div className="category-hero__content">
              <h1 id="category-title">Browse Top Categories</h1>
              <p>Choose a category to explore a wide range of quizzes</p>
              <div className="category-hero__accent"></div>
            </div>

            <div className="category-hero__stats" aria-label="Category statistics">
              <article>
                <strong>{categories.length}</strong>
                <span>Total Categories</span>
              </article>
              <article>
                <strong>{categories.reduce((sum, c) => sum + (c.quizCount || 0), 0)}</strong>
                <span>Total Quizzes</span>
              </article>
            </div>
          </div>
        </section>

        {/* ── Search Section ────────────────────────────── */}
        <section className="category-search section" aria-labelledby="category-search-title">
          <div className="container">
            <div className="category-section-heading">
              <h2 id="category-search-title">Search quizzes</h2>
              <p>Find quizzes across all categories.</p>
            </div>
            <SearchBar placeholder="Search quizzes..." onSearch={handleSearch} />
          </div>
        </section>

        {/* ── Categories Grid ──────────────────────────── */}
        <section className="category-grid-section section" aria-labelledby="categories-grid-title">
          <div className="container">
            <div className="category-section-heading category-section-heading--centered">
              <h2 id="categories-grid-title">All Categories</h2>
              <p>Select a category to view its quizzes.</p>
              <div className="category-heading__accent"></div>
            </div>

            {loading ? (
              <p className="category-loading">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="category-loading">No categories yet — quizzes will appear here once created.</p>
            ) : (
              <div className="category-cards-grid">
                {categories.map((category) => {
                  const style = getCategoryStyle(category.name);
                  return (
                    <Link
                      key={category.name}
                      to={`/subcategory/${encodeURIComponent(category.name)}`}
                      className="category-card"
                    >
                      <article className="category-card__inner">
                        <div
                          className="category-card__icon"
                          style={{ backgroundColor: style.bg, color: style.color }}
                        >
                          {style.icon}
                        </div>
                        <h3 className="category-card__name">{category.name}</h3>
                        <p className="category-card__count">
                          {category.quizCount || 0}+ Quizzes
                        </p>
                        <span className="category-card__explore">Explore &rarr;</span>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Browse full library CTA ──────────────────── */}
        <section className="category-cta section" aria-labelledby="category-cta-title">
          <div className="container">
            <div className="category-section-heading category-section-heading--split">
              <div>
                <h2 id="category-cta-title">Browse the full library</h2>
                <p>See every quiz, or use a category above to filter.</p>
              </div>
              <Link to="/all-quizzes" className="category-section-heading__link">
                View all quizzes
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Category;
