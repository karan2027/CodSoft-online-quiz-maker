import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import * as authService from "../../services/authService";

import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      return "Email address is required.";
    }

    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateEmail();
    setError(validationError);
    setSuccessMessage("");

    if (validationError) {
      return;
    }

    setIsLoading(true);

    const result = await authService.forgotPassword(email.trim());
    setIsLoading(false);

    if (!result.success) {
      setError(result.message || "Unable to send OTP. Please try again.");
      return;
    }

    setSuccessMessage(result.message || "An OTP has been sent to your registered email address.");

    window.setTimeout(() => {
      navigate("/verify-otp", { state: { email: email.trim() } });
    }, 1000);
  };

  return (
    <>
      <Navbar />

      <main className="forgot-password-page">
        <section
          className="forgot-password-page__section"
          aria-labelledby="forgot-password-title"
        >
          <div className="forgot-password-card">
            <div className="forgot-password-card__header">
              <p className="forgot-password-card__eyebrow">Account Recovery</p>
              <h1 id="forgot-password-title">Forgot Password?</h1>
              <p>
                Enter your registered email address and we will send an OTP to reset
                your password.
              </p>
            </div>

            <form
              className="forgot-password-form"
              noValidate
              onSubmit={handleSubmit}
            >
              {error ? (
                <p className="forgot-password-form__error" role="alert">
                  {error}
                </p>
              ) : null}

              {successMessage ? (
                <p className="forgot-password-form__success" role="status">
                  {successMessage}
                </p>
              ) : null}

              <div className="forgot-password-form__group">
                <label htmlFor="forgot-email">Email Address</label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  autoComplete="email"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "forgot-email-error" : undefined}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setSuccessMessage("");
                  }}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                Send OTP
              </Button>

              <p className="forgot-password-form__footer-text">
                Remember your password?{" "}
                <Link to="/login" className="forgot-password-form__link">
                  Back to Login
                </Link>
              </p>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ForgotPassword;