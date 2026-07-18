import React from "react";
import { FaGithub, FaLinkedin, FaInstagram, FaEnvelope, FaWhatsapp, FaGraduationCap, FaCode } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./About.css";

const About = () => {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="about-page">
        <div className="about-hero">
          <h1>About QuizMaster Pro</h1>
          <p>Making learning interactive, engaging, and enjoyable for everyone.</p>
        </div>

        <div className="container">
          <div className="about-content-card">
            <h2>Our Platform</h2>
            <p>
              Welcome to <strong>QuizMaster Pro</strong>, an online quiz platform built to make learning interactive, engaging, and enjoyable. Our platform allows users to create quizzes, explore quizzes from different categories, participate in quizzes, improve their knowledge, and track their performance through detailed results and leaderboards.
            </p>
            <p>
              QuizMaster Pro is designed for students, learners, educators, and anyone who enjoys testing and improving their knowledge. The goal of this platform is to provide a simple, fast, and user-friendly experience where everyone can learn while having fun.
            </p>
            <p>
              This website has been developed as a personal full-stack MERN project using modern web development technologies and follows industry-standard coding practices. It focuses on performance, security, responsive design, and a clean user experience.
            </p>
          </div>

          <div className="about-developer-card">
            <div className="developer-header">
              <div className="developer-avatar">
                CK
              </div>
              <div>
                <h2>About the Developer</h2>
                <h3 className="developer-name">Chhotelal Kushwaha</h3>
                <p className="developer-role"><FaCode className="dev-icon"/> Full Stack MERN Developer</p>
              </div>
            </div>

            <div className="developer-details">
              <p className="developer-bio">
                I am a passionate MERN Stack Developer who enjoys building scalable, secure, and user-friendly web applications while continuously learning new technologies.
              </p>
              
              <div className="developer-info-grid">
                <div className="info-item">
                  <strong>Project:</strong> QuizMaster Pro
                </div>
                <div className="info-item">
                  <strong><FaGraduationCap className="dev-icon"/> Education:</strong> 
                  <br/>Bachelor of Technology (B.Tech) in Computer Science & Engineering
                  <br/><span className="university-name">Hemvati Nandan Bahuguna Garhwal University</span>
                </div>
              </div>

              <div className="developer-socials">
                <a href="https://github.com/karan2027" target="_blank" rel="noopener noreferrer" className="social-link github">
                  <FaGithub />
                </a>
                <a href="https://www.linkedin.com/in/chhotelal-kushwaha-2902a3329" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                  <FaLinkedin />
                </a>
                <a href="https://www.instagram.com/karankushwaha2024" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                  <FaInstagram />
                </a>
                <a href="mailto:chhotelalkushwahak9628@gmail.com" className="social-link email">
                  <FaEnvelope />
                </a>
                <a href="https://wa.me/917317038848" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                  <FaWhatsapp />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
