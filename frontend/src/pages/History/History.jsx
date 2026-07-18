import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchBar from "../../components/SearchBar";
import { useQuiz } from "../../context/QuizContext";

import "./History.css";

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

function History() {
  const { quizHistory, loadQuizHistory, loading, error } = useQuiz();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedResult, setSelectedResult] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    loadQuizHistory();
  }, [loadQuizHistory]);

  // Derived statistics from real history
  const stats = useMemo(() => {
    const total = quizHistory.length;
    const average = total
      ? Math.round(
          quizHistory.reduce((sum, item) => sum + (item.percentage || 0), 0) / total
        )
      : 0;
    const highest = total
      ? Math.max(...quizHistory.map((item) => item.percentage || 0))
      : 0;

    return {
      totalAttempts: total,
      averageScore: average,
      highestScore: highest,
    };
  }, [quizHistory]);

  // Derive unique categories from history
  const categories = useMemo(() => {
    const list = quizHistory
      .map((item) => item.quiz?.category)
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [quizHistory]);

  // Filter and sort history records
  const filteredRecords = useMemo(() => {
    return quizHistory
      .filter((record) => {
        const matchesSearch = record.quiz?.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" ||
          record.quiz?.category?.toLowerCase().replaceAll(" ", "-") === selectedCategory;
        const matchesDifficulty =
          selectedDifficulty === "all" ||
          record.quiz?.difficulty?.toLowerCase() === selectedDifficulty;
        
        // Pass/Fail status calculation (60% passing mark)
        const isPass = (record.percentage || 0) >= 60;
        const matchesResult =
          selectedResult === "all" ||
          (selectedResult === "pass" && isPass) ||
          (selectedResult === "fail" && !isPass);

        return matchesSearch && matchesCategory && matchesDifficulty && matchesResult;
      })
      .sort((a, b) => {
        if (sortBy === "latest") {
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        }
        if (sortBy === "highest-score") {
          return (b.percentage || 0) - (a.percentage || 0);
        }
        if (sortBy === "lowest-score") {
          return (a.percentage || 0) - (b.percentage || 0);
        }
        if (sortBy === "alphabetical") {
          return (a.quiz?.title || "").localeCompare(b.quiz?.title || "");
        }
        return 0;
      });
  }, [quizHistory, searchTerm, selectedCategory, selectedDifficulty, selectedResult, sortBy]);

  const handleSearch = (term) => {
    setSearchTerm(term || "");
  };

  return (
    <>
      <Navbar />

      <main className="history-page">
        <section className="history-hero" aria-labelledby="history-title">
          <div className="container">
            <p className="history-hero__eyebrow">Attempt Records</p>
            <h1 id="history-title">Quiz History</h1>
            <p>Review your previous quiz attempts, scores, ranks and results.</p>

            <div className="history-hero__stats" aria-label="Quiz history summary">
              <article>
                <strong>{stats.totalAttempts}</strong>
                <span>Total Quizzes Attempted</span>
              </article>
              <article>
                <strong>{stats.averageScore}%</strong>
                <span>Average Score</span>
              </article>
              <article>
                <strong>{stats.highestScore}%</strong>
                <span>Highest Score</span>
              </article>
            </div>
          </div>
        </section>

        <section className="history-search section" aria-labelledby="history-search-title">
          <div className="container">
            <div className="history-section-heading">
              <h2 id="history-search-title">Search history</h2>
              <p>Find attempts by quiz title, category or result.</p>
            </div>

            <SearchBar placeholder="Search quiz history..." onSearch={handleSearch} />
          </div>
        </section>

        <section className="history-content section" aria-labelledby="history-table-title">
          <div className="container">
            <div className="history-section-heading">
              <h2 id="history-table-title">Attempt history</h2>
              <p>Filter and sort your completed quiz attempts.</p>
            </div>

            <form className="history-filters" aria-label="Filter and sort history" onSubmit={(e) => e.preventDefault()}>
              <div className="history-filters__group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category.toLowerCase().replaceAll(" ", "-")}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="history-filters__group">
                <label htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="history-filters__group">
                <label htmlFor="result">Result</label>
                <select
                  id="result"
                  name="result"
                  value={selectedResult}
                  onChange={(e) => setSelectedResult(e.target.value)}
                >
                  <option value="all">All Results</option>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                </select>
              </div>

              <div className="history-filters__group history-filters__group--wide">
                <label htmlFor="sortBy">Sort Options</label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="highest-score">Highest Score</option>
                  <option value="lowest-score">Lowest Score</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </form>

            {loading ? (
              <p>Loading your history...</p>
            ) : error ? (
              <p role="alert" className="error-message">{error}</p>
            ) : filteredRecords.length === 0 ? (
              <div className="history-empty-state">
                <p>No attempts match your filters.</p>
              </div>
            ) : (
              <div className="history-table-card">
                <div className="history-table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th scope="col">Quiz Title</th>
                        <th scope="col">Category</th>
                        <th scope="col">Difficulty</th>
                        <th scope="col">Date Attempted</th>
                        <th scope="col">Score</th>
                        <th scope="col">Percentage</th>
                        <th scope="col">Time Taken</th>
                        <th scope="col">Result</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record) => {
                        const isPass = (record.percentage || 0) >= 60;
                        return (
                          <tr key={record._id}>
                            <td>{record.quiz?.title || "Untitled Quiz"}</td>
                            <td>{record.quiz?.category || "-"}</td>
                            <td>
                              <span
                                className={`history-table__difficulty history-table__difficulty--${record.quiz?.difficulty?.toLowerCase()}`}
                              >
                                {capitalize(record.quiz?.difficulty)}
                              </span>
                            </td>
                            <td>{formatDate(record.submittedAt)}</td>
                            <td>{record.score} / {record.totalMarks}</td>
                            <td>{Math.round(record.percentage || 0)}%</td>
                            <td>{formatTimeTaken(record.timeTaken)}</td>
                            <td>
                              <span
                                className={`history-table__result history-table__result--${isPass ? "pass" : "fail"}`}
                              >
                                {isPass ? "Pass" : "Fail"}
                              </span>
                            </td>
                            <td>
                              <Link
                                to={`/result/${record._id}`}
                                className="history-table__action"
                              >
                                View Result
                              </Link>
                            </td>
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
      </main>

      <Footer />
    </>
  );
}

export default History;