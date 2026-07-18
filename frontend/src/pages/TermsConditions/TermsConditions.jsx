import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./TermsConditions.css";

const TermsConditions = () => {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="terms-page">
        <div className="terms-hero">
          <h1>Terms & Conditions</h1>
          <p>Please read these terms carefully before using QuizMaster Pro.</p>
        </div>

        <div className="container">
          <div className="terms-content-card">
            <div className="terms-section">
              <h3>1. Agreement to Terms</h3>
              <p>
                Welcome to QuizMaster Pro. By accessing or using this website, you agree to comply with these Terms & Conditions.
              </p>
            </div>

            <div className="terms-section">
              <h3>2. User Responsibilities</h3>
              <p>
                Users are responsible for maintaining the confidentiality of their account information and for all activities performed using their account.
              </p>
            </div>

            <div className="terms-section">
              <h3>3. Acceptable Use</h3>
              <p>
                Users must not upload harmful, offensive, illegal, misleading, or copyrighted content without permission.
              </p>
            </div>

            <div className="terms-section">
              <h3>4. Modifications to Service</h3>
              <p>
                QuizMaster Pro reserves the right to modify, suspend, or discontinue any feature of the platform at any time without prior notice.
              </p>
            </div>

            <div className="terms-section">
              <h3>5. Limitation of Liability</h3>
              <p>
                We are not responsible for any data loss, service interruption, or technical issues beyond our control.
              </p>
            </div>

            <div className="terms-section">
              <h3>6. Changes to Terms</h3>
              <p>
                Continued use of the platform means you accept any future updates to these Terms & Conditions.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;
