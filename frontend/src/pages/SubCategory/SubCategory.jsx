import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "./SubCategory.css";

function SubCategory() {
  const { categoryName } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/categories/${encodeURIComponent(categoryName)}/subcategories`
        );
        if (response.data.success) {
          setSubcategories(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
      setLoading(false);
    };

    fetchSubcategories();
  }, [categoryName]);

  return (
    <>
      <Navbar />
      <main className="subcategory-page">
        <section className="subcategory-page__hero">
          <div className="container">
            <Link to="/" className="subcategory-page__back">
              &larr; Back to Categories
            </Link>
            <h1>{categoryName}</h1>
            <p>Select a subcategory to view available quizzes.</p>
          </div>
        </section>

        <section className="subcategory-page__content">
          <div className="container">
            {loading ? (
              <p>Loading subcategories...</p>
            ) : subcategories.length === 0 ? (
              <p>No quizzes available.</p>
            ) : (
              <div className="subcategory-grid">
                {subcategories.map((sub) => (
                  <Link 
                    key={sub.name} 
                    to={`/quiz-list/${encodeURIComponent(categoryName)}/${encodeURIComponent(sub.name)}`}
                    className="subcategory-card"
                  >
                    <h3>{sub.name}</h3>
                    <p className="subcategory-card__count">{sub.quizCount} Quizzes</p>
                    <p className="subcategory-card__desc">{sub.description}</p>
                    <span className="subcategory-card__action">Explore Quizzes &rarr;</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default SubCategory;