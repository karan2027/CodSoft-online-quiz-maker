import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const primaryLinks = [
  { label: "Home", path: "/" },
  { label: "Categories", path: "/category" },
  { label: "All Quizzes", path: "/all-quizzes" },
  { label: "Create Quiz", path: "/create-quiz" },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive ? "navbar__link navbar__link--active" : "navbar__link";

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <nav className="navbar__container" aria-label="Main navigation">
        <NavLink to="/" className="navbar__logo" onClick={closeMenu}>
          Online Quiz Maker
        </NavLink>

        <button
          type="button"
          className={`navbar__toggle ${isMenuOpen ? "navbar__toggle--active" : ""}`}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="navbar-menu"
          onClick={() => setIsMenuOpen((currentState) => !currentState)}
        >
          <span className="navbar__toggle-line" />
          <span className="navbar__toggle-line" />
          <span className="navbar__toggle-line" />
        </button>

        <div
          id="navbar-menu"
          className={`navbar__menu ${isMenuOpen ? "navbar__menu--open" : ""}`}
        >
          <ul className="navbar__links">
            {primaryLinks.map((link) => (
              <li className="navbar__item" key={link.path}>
                <NavLink
                  to={link.path}
                  className={getNavLinkClass}
                  onClick={closeMenu}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar__actions">
            {isSearchExpanded ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = e.target.search.value;
                  setIsSearchExpanded(false);
                  if (q.trim()) {
                    navigate(`/all-quizzes?search=${encodeURIComponent(q.trim())}`);
                  }
                }}
                className="navbar__search-form"
              >
                <input
                  type="text"
                  name="search"
                  placeholder="Search quizzes..."
                  autoFocus
                  onBlur={(e) => {
                    // Slight delay to allow onSubmit or button click to process
                    setTimeout(() => setIsSearchExpanded(false), 200);
                  }}
                  className="navbar__search-input"
                />
                <button type="submit" className="navbar__search-submit" title="Search">
                  ⌕
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="navbar__search"
                aria-label="Search quizzes"
                title="Search"
                onClick={() => setIsSearchExpanded(true)}
              >
                <span aria-hidden="true">⌕</span>
              </button>
            )}

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? "navbar__auth-link navbar__auth-link--active"
                      : "navbar__auth-link"
                  }
                  onClick={closeMenu}
                >
                  {user?.fullName ? `Hi, ${user.fullName.split(" ")[0]}` : "Dashboard"}
                </NavLink>

                <button
                  type="button"
                  className="navbar__auth-link navbar__auth-link--primary"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive
                      ? "navbar__auth-link navbar__auth-link--active"
                      : "navbar__auth-link"
                  }
                  onClick={closeMenu}
                >
                  Login
                </NavLink>

                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    isActive
                      ? "navbar__auth-link navbar__auth-link--primary navbar__auth-link--active"
                      : "navbar__auth-link navbar__auth-link--primary"
                  }
                  onClick={closeMenu}
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;