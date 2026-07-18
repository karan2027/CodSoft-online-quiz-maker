import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import SearchBar from "../../components/SearchBar";
import QuizCard from "../../components/QuizCard";
import * as quizService from "../../services/quizService";

import "./QuizListing.css";

const capitalize = (value) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

function QuizListing() {
  const navigate = useNavigate();
  const { categoryName, subcategoryName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [quizzes, setQuizzes] = useState([]);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination state
  const page = parseInt(searchParams.get("page")) || 1;
  const [difficulty, setDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const limit = 12;
  const totalPages = Math.ceil(totalQuizzes / limit) || 1;

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          category: categoryName,
          subcategory: subcategoryName,
        };
        
        if (difficulty !== "all") params.difficulty = difficulty;
        if (sortBy === "most-attempted") params.sort = "trending";
        if (sortBy === "highest-rated") params.sort = "popular";

        const searchTerm = searchParams.get("search");
        if (searchTerm) params.search = searchTerm;

        const result = await quizService.getAllQuizzes(params);
        if (result.success && result.data) {
          setQuizzes(result.data.quizzes || []);
          setTotalQuizzes(result.data.total || 0);
        }
      } catch (err) {
        console.error("Error fetching quizzes:", err);
      }
      setLoading(false);
    };

    fetchQuizzes();
  }, [categoryName, subcategoryName, page, difficulty, sortBy, searchParams]);

  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      searchParams.set("search", searchTerm);
    } else {
      searchParams.delete("search");
    }
    searchParams.set("page", 1);
    setSearchParams(searchParams);
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz-details/${quizId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      searchParams.set("page", newPage);
      setSearchParams(searchParams);
    }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <>
      <Navbar />

      <main className="quiz-listing-page">
        <section className="quiz-listing-hero" aria-labelledby="quiz-listing-title">
          <div className="container">
            <nav className="quiz-listing-breadcrumb" aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to={`/subcategory/${encodeURIComponent(categoryName)}`}>{categoryName}</Link>
                </li>
                <li aria-current="page">{subcategoryName}</li>
              </ol>
            </nav>

            <p className="quiz-listing-hero__eyebrow">Quiz Listing</p>
            <h1 id="quiz-listing-title">{subcategoryName} Quizzes</h1>
            <p>
              Browse curated {subcategoryName} quizzes from the {categoryName} category.
            </p>

            <div className="quiz-listing-hero__stats" aria-label="Quiz listing summary">
              <article>
                <strong>{categoryName}</strong>
                <span>Category</span>
              </article>
              <article>
                <strong>{subcategoryName}</strong>
                <span>Subcategory</span>
              </article>
              <article>
                <strong>{totalQuizzes}</strong>
                <span>Total Quizzes Available</span>
              </article>
            </div>
          </div>
        </section>

        <section className="quiz-listing-search section" aria-labelledby="quiz-search-title">
          <div className="container">
            <div className="quiz-listing-section-heading">
              <h2 id="quiz-search-title">Search quizzes</h2>
              <p>Find quizzes by title, topic, tags or difficulty.</p>
            </div>

            <SearchBar placeholder={`Search ${subcategoryName} quizzes...`} onSearch={handleSearch} />
          </div>
        </section>

        <section className="quiz-listing-content section" aria-labelledby="available-quizzes-title">
          <div className="container">
            <div className="quiz-listing-section-heading quiz-listing-section-heading--split">
              <div>
                <h2 id="available-quizzes-title">Available quizzes</h2>
                <p>Use filters and sorting to find the right quiz.</p>
              </div>
            </div>

            <form className="quiz-listing-filters" aria-label="Filter and sort quizzes">
              <div className="quiz-listing-filters__group">
                <label htmlFor="difficulty">Difficulty</label>
                <select 
                  id="difficulty" 
                  value={difficulty} 
                  onChange={(e) => { setDifficulty(e.target.value); searchParams.set("page", 1); setSearchParams(searchParams); }}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="quiz-listing-filters__group quiz-listing-filters__group--wide">
                <label htmlFor="sortBy">Sort By</label>
                <select 
                  id="sortBy" 
                  value={sortBy} 
                  onChange={(e) => { setSortBy(e.target.value); searchParams.set("page", 1); setSearchParams(searchParams); }}
                >
                  <option value="newest">Newest</option>
                  <option value="most-attempted">Most Attempted</option>
                  <option value="highest-rated">Highest Rated</option>
                </select>
              </div>
            </form>

            {loading ? (
              <p>Loading quizzes...</p>
            ) : quizzes.length === 0 ? (
              <p>No quizzes found matching your criteria.</p>
            ) : (
              <div className="quiz-listing-grid">
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

            {totalPages > 1 && (
              <nav className="quiz-listing-pagination" aria-label="Quiz listing pagination">
                <Button 
                  variant="outline" 
                  size="medium" 
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>

                <div className="quiz-listing-pagination__numbers">
                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`quiz-listing-pagination__number ${pageNumber === page ? "quiz-listing-pagination__number--active" : ""}`}
                      onClick={() => handlePageChange(pageNumber)}
                      aria-label={`Go to page ${pageNumber}`}
                      aria-current={pageNumber === page ? "page" : undefined}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  size="medium"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </nav>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default QuizListing;