import { useEffect, useState } from "react";
import "./SearchBar.css";

function SearchBar({
  placeholder = "Search quizzes...",
  onSearch,
  defaultValue = "",
  disabled = false,
  className = "",
}) {
  const [searchTerm, setSearchTerm] = useState(defaultValue);

  useEffect(() => {
    setSearchTerm(defaultValue || "");
  }, [defaultValue]);

  const handleSearch = () => {
    if (disabled) {
      return;
    }

    const trimmedValue = searchTerm.trim();

    if (onSearch) {
      onSearch(trimmedValue);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  const handleClear = () => {
    if (disabled) {
      return;
    }

    setSearchTerm("");

    if (onSearch) {
      onSearch("");
    }
  };

  const searchBarClasses = ["search-bar", className].filter(Boolean).join(" ");

  return (
    <form className={searchBarClasses} role="search" onSubmit={handleSubmit}>
      <label className="search-bar__label" htmlFor="search-bar-input">
        Search quizzes
      </label>

      <div className="search-bar__field">
        <span className="search-bar__icon" aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            focusable="false"
          >
            <path
              d="M10.8 18.1C14.8317 18.1 18.1 14.8317 18.1 10.8C18.1 6.76832 14.8317 3.5 10.8 3.5C6.76832 3.5 3.5 6.76832 3.5 10.8C3.5 14.8317 6.76832 18.1 10.8 18.1Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M16.2 16.2L20.5 20.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <input
          id="search-bar-input"
          className="search-bar__input"
          type="search"
          value={searchTerm}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Search quizzes"
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        {searchTerm ? (
          <button
            type="button"
            className="search-bar__clear"
            aria-label="Clear search"
            disabled={disabled}
            onClick={handleClear}
          >
            ×
          </button>
        ) : null}
      </div>

      <button
        type="submit"
        className="search-bar__button"
        disabled={disabled}
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;