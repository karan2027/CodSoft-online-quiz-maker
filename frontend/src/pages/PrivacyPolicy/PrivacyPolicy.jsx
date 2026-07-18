import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="policy-page">
        <div className="policy-hero">
          <h1>Privacy Policy</h1>
          <p>Your privacy and data security are important to us.</p>
        </div>

        <div className="container">
          <div className="policy-content-card">
            <p>
              Your privacy is important to us. QuizMaster Pro only collects the information necessary to provide our services, such as your name, email address, and quiz-related data.
            </p>
            <p>
              We do not sell, rent, or share your personal information with third parties except where required by law.
            </p>
            <p>
              Your information is used only for account management, authentication, quiz participation, improving user experience, and platform functionality.
            </p>
            <p>
              We take reasonable security measures to protect your information; however, no online service can guarantee complete security.
            </p>
            <p>
              By using QuizMaster Pro, you agree to the collection and use of your information as described in this Privacy Policy.
            </p>
            <p>
              This Privacy Policy may be updated from time to time without prior notice.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
