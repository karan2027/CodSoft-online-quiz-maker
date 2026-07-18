import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaInstagram, FaEnvelope } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-grid">
          {/* Column 1: Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-brand__logo" aria-label="QuizMaster Pro Home">
              QuizMaster Pro
            </Link>
            <p className="footer-brand__description">
              QuizMaster Pro is a modern online quiz platform where users can
              create quizzes, browse quizzes by category, participate in public
              quizzes, challenge friends using quiz codes, track their
              performance, and compete on leaderboards.
            </p>
          </div>

          {/* Column 2: Support */}
          <nav className="footer-section" aria-label="Support Navigation">
            <h2 className="footer-title">Support</h2>
            <ul className="footer-list">
              <li>
                <Link to="/about" className="footer-link" aria-label="About Us">
                  About Us
                </Link>
              </li>
              <li>
                <a 
                  href="https://wa.me/917317038848"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link" 
                  aria-label="Contact via WhatsApp"
                >
                  Contact
                </a>
              </li>
              <li>
                <Link to="/privacy-policy" className="footer-link" aria-label="Privacy Policy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="footer-link" aria-label="Terms & Conditions">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 3: Connect With Me */}
          <nav className="footer-section" aria-label="Social Media Navigation">
            <h2 className="footer-title">Connect With Me</h2>
            <div className="footer-socials">
              <a
                href="https://github.com/karan2027"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon"
                aria-label="Visit GitHub Profile"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/chhotelal-kushwaha-2902a3329?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon"
                aria-label="Visit LinkedIn Profile"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://www.instagram.com/karankushwaha2024"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon"
                aria-label="Visit Instagram Profile"
              >
                <FaInstagram />
              </a>
              <a
                href="mailto:chhotelalkushwahak9628@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon"
                aria-label="Send Email"
              >
                <FaEnvelope />
              </a>
            </div>
          </nav>

          {/* Column 4: Quick Links */}
          <nav className="footer-section" aria-label="Quick Links Navigation">
            <h2 className="footer-title">Quick Links</h2>
            <ul className="footer-list">
              <li>
                <Link to="/" className="footer-link" aria-label="Home">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/category" className="footer-link" aria-label="Categories">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/all-quizzes" className="footer-link" aria-label="Browse Quizzes">
                  Browse Quizzes
                </Link>
              </li>
              <li>
                <Link to="/create-quiz" className="footer-link" aria-label="Create Quiz">
                  Create Quiz
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="footer-link" aria-label="Dashboard">
                  Dashboard
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Footer */}
        <div className="footer-bottom">
          <p>&copy; 2026 QuizMaster Pro. All Rights Reserved.</p>
          <p className="footer-bottom__creator">
            Designed & Developed with <span className="footer-heart">❤️</span> by Chhotelal Kushwaha
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;