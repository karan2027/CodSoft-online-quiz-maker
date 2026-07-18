import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const StaticPage = ({ title }) => {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 140px)", padding: "4rem 2rem", textAlign: "center", background: "var(--color-bg)", color: "var(--color-text-main)" }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto", background: "var(--color-surface)", padding: "3rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid var(--color-border)" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "1.5rem", color: "var(--color-primary)" }}>{title}</h1>
          {title === "About Us" ? (
            <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "var(--color-text-muted)" }}>
              QuizMaster Pro was built to make learning fun, interactive, and accessible for everyone. Our platform enables users to create quizzes, explore quizzes from multiple categories, share quizzes with others, participate in public challenges, and improve their knowledge while tracking their progress through detailed results and leaderboards.
            </p>
          ) : (
            <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "var(--color-text-muted)" }}>
              This page is currently under construction. Please check back later for updates to our {title.toLowerCase()}.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default StaticPage;
