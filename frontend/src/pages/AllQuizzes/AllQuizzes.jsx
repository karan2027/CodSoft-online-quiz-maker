import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import SearchBar from "../../components/SearchBar";
import QuizCard from "../../components/QuizCard";
import { useQuiz } from "../../context/QuizContext";

import "./AllQuizzes.css";

const capitalize = (value) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

function AllQuizzes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    quizzes,
    total,
    page,
    pages,
    categories,
    loading,
    error,
    fetchQuizzes,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    searchQuery,
    setSearchQuery,
  } = useQuiz();

  // Local UI state for the "public/private" filter, which the backend DOES
  // support (isPublic query param) but isn't tracked in QuizContext by default.
  const handleVisibilityChange = (event) => {
    const value = event.target.value;
    fetchQuizzes({
      isPublic: value === "all" ? undefined : value === "public",
      page: 1,
    });
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setSelectedCategory(value === "all" ? null : value);
  };

  const handleDifficultyChange = (event) => {
    const value = event.target.value;
    setSelectedDifficulty(value === "all" ? "" : value);
  };

  const handleSearch = (searchTerm) => {
    setSearchQuery(searchTerm);
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const goToPage = (targetPage) => {
    if (targetPage < 1 || targetPage > pages) return;
    fetchQuizzes({ page: targetPage });
  };

  // Pick up ?search= and ?category= from links elsewhere in the app (e.g. Home page)
  useEffect(() => {
    const searchFromUrl = searchParams.get("search");
    const categoryFromUrl = searchParams.get("category");

    if (searchFromUrl) setSearchQuery(searchFromUrl);
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl);

    fetchQuizzes({
      page: 1,
      search: searchFromUrl || undefined,
      category: categoryFromUrl || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const pageNumbers = Array.from({ length: pages }, (_, index) => index + 1);

  return (
    <>
      <Navbar />

      <main className="all-quizzes-page">
        <section className="all-quizzes-hero" aria-labelledby="all-quizzes-title">
          <div className="container">
            <p className="all-quizzes-hero__eyebrow">Quiz Library</p>
            <h1 id="all-quizzes-title">All Quizzes</h1>
            <p>Explore quizzes across categories, difficulty levels and learning goals.</p>

            <div className="all-quizzes-hero__summary" aria-label="Quiz summary">
              <article>
                <strong>{total}+</strong>
                <span>Total Quizzes Available</span>
              </article>
            </div>
          </div>
        </section>

        <section className="all-quizzes-search section" aria-labelledby="all-quizzes-search-title">
          <div className="container">
            <div className="all-quizzes-section-heading">
              <h2 id="all-quizzes-search-title">Search quizzes</h2>
              <p>Search by title.</p>
            </div>

            <SearchBar placeholder="Search all quizzes..." onSearch={handleSearch} defaultValue={searchQuery} />
          </div>
        </section>

        <section className="all-quizzes-content section" aria-labelledby="all-quizzes-grid-title">
          <div className="container">
            <div className="all-quizzes-section-heading">
              <h2 id="all-quizzes-grid-title">Available quizzes</h2>
              <p>Use filters to find the right quiz faster.</p>
            </div>

            <form className="all-quizzes-filters" aria-label="Filter all quizzes" onSubmit={(e) => e.preventDefault()}>
              <div className="all-quizzes-filters__group all-quizzes-filters__group--wide">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={selectedCategory || "all"}
                  onChange={handleCategoryChange}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="all-quizzes-filters__group">
                <label htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={selectedDifficulty || "all"}
                  onChange={handleDifficultyChange}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="all-quizzes-filters__group">
                <label htmlFor="quizType">Public / Private</label>
                <select id="quizType" name="quizType" defaultValue="all" onChange={handleVisibilityChange}>
                  <option value="all">All Types</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </form>

            {error ? <p className="all-quizzes-error" role="alert">{error}</p> : null}

            {loading ? (
              <p className="all-quizzes-loading">Loading quizzes...</p>
            ) : quizzes.length === 0 ? (
              <p className="all-quizzes-empty">No quizzes match your filters yet.</p>
            ) : (
              <div className="all-quizzes-grid">
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz._id}
                    quizId={quiz._id}
                    quizCode={quiz.quizCode}
                    title={quiz.title}
                    description={quiz.description}
                    category={quiz.category}
                    difficulty={capitalize(quiz.difficulty)}
                    totalQuestions={quiz.questions?.length || 0}
                    estimatedTime={`${quiz.timeLimit} min`}
                    createdBy={quiz.createdBy?.fullName || "Unknown"}
                    totalAttempts={quiz.attemptCount || 0}
                    averageScore={quiz.averageScore || 0}
                    isPrivate={!quiz.isPublic}
                    passwordProtected={!quiz.isPublic}
                    onStartQuiz={handleStartQuiz}
                  />
                ))}
              </div>
            )}

            {pages > 1 ? (
              <nav className="all-quizzes-pagination" aria-label="All quizzes pagination">
                <Button
                  variant="outline"
                  size="medium"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </Button>

                <div className="all-quizzes-pagination__numbers">
                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={
                        pageNumber === page
                          ? "all-quizzes-pagination__number all-quizzes-pagination__number--active"
                          : "all-quizzes-pagination__number"
                      }
                      aria-label={`Go to page ${pageNumber}`}
                      aria-current={pageNumber === page ? "page" : undefined}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="medium"
                  disabled={page >= pages}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </Button>
              </nav>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default AllQuizzes;
