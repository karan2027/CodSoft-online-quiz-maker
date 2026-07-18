import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import * as authService from "../../services/authService";

import "./Register.css";

const initialFormData = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  otp: "",
  acceptTerms: false,
};

function Register() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = (checkOtp = false) => {
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!formData.fullName.trim()) {
      validationErrors.fullName = "Full name is required.";
    }

    if (!formData.username.trim()) {
      validationErrors.username = "Username is required.";
    } else if (formData.username.trim().length < 3) {
      validationErrors.username = "Username must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      validationErrors.username = "Username can contain only letters, numbers, and underscores.";
    }

    if (!formData.email.trim()) {
      validationErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      validationErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      validationErrors.password = "Password is required.";
    } else if (!strongPasswordRegex.test(formData.password)) {
      validationErrors.password =
        "Password must be 8+ characters with uppercase, lowercase, number and special character (@$!%*?&).";
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = "Confirm password is required.";
    } else if (formData.confirmPassword !== formData.password) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.acceptTerms) {
      validationErrors.acceptTerms = "You must accept the Terms & Conditions.";
    }

    if (checkOtp) {
      if (!formData.otp.trim()) {
        validationErrors.otp = "Verification OTP is required.";
      } else if (formData.otp.trim().length !== 6 || isNaN(formData.otp.trim())) {
        validationErrors.otp = "OTP must be a 6-digit number.";
      }
    }

    return validationErrors;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
      form: "",
    }));
  };

  const handleSendOTP = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    
    // Validate fields before sending OTP
    const validationErrors = validateForm(false);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsOtpSending(true);
    const result = await authService.sendRegisterOTP(formData.email.trim());
    setIsOtpSending(false);

    if (!result.success) {
      setErrors({ form: result.message });
      return;
    }

    setOtpSent(true);
    setSuccessMessage("OTP has been sent to your email. Please verify below.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");

    const validationErrors = validateForm(true);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    const result = await register({
      fullName: formData.fullName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      otp: formData.otp.trim(),
    });

    setIsLoading(false);

    if (!result.success) {
      setErrors({ form: result.message });
      return;
    }

    // Since register logs them in automatically (sets token and user states in AuthContext),
    // redirect to dashboard directly
    navigate("/dashboard", { replace: true });
  };

  const handleResendOTP = async () => {
    setSuccessMessage("");
    setErrors({});
    setIsOtpSending(true);
    const result = await authService.sendRegisterOTP(formData.email.trim());
    setIsOtpSending(false);

    if (!result.success) {
      setErrors({ form: result.message });
      return;
    }

    setSuccessMessage("OTP has been resent to your email successfully!");
  };

  return (
    <>
      <Navbar />

      <main className="register-page">
        <section className="register-page__section" aria-labelledby="register-title">
          <div className="register-card">
            <div className="register-card__header">
              <p className="register-card__eyebrow">Create Account</p>
              <h1 id="register-title">Register for Online Quiz Maker</h1>
              <p>Join the platform to create quizzes, attempt tests and track progress.</p>
            </div>

            <form className="register-form" noValidate onSubmit={otpSent ? handleSubmit : handleSendOTP}>
              {errors.form ? (
                <p className="register-form__error" role="alert">
                  {errors.form}
                </p>
              ) : null}

              {successMessage ? (
                <p className="register-form__success" role="status">
                  {successMessage}
                </p>
              ) : null}

              <div className="register-form__group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={otpSent}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  onChange={handleChange}
                />
                {errors.fullName ? (
                  <p className="register-form__error" id="fullName-error">
                    {errors.fullName}
                  </p>
                ) : null}
              </div>

              <div className="register-form__row">
                <div className="register-form__group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={otpSent}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    onChange={handleChange}
                  />
                  {errors.email ? (
                    <p className="register-form__error" id="email-error">
                      {errors.email}
                    </p>
                  ) : null}
                </div>

                <div className="register-form__group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    placeholder="Choose a username"
                    disabled={otpSent}
                    aria-invalid={Boolean(errors.username)}
                    aria-describedby={errors.username ? "username-error" : undefined}
                    onChange={handleChange}
                  />
                  {errors.username ? (
                    <p className="register-form__error" id="username-error">
                      {errors.username}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="register-form__row">
                <div className="register-form__group">
                  <label htmlFor="password">Password</label>
                  <div className="register-form__password-field">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      placeholder="Create password"
                      autoComplete="new-password"
                      disabled={otpSent}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="register-form__password-toggle"
                      disabled={otpSent}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((currentValue) => !currentValue)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="register-form__error" id="password-error">
                      {errors.password}
                    </p>
                  ) : null}
                </div>

                <div className="register-form__group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    disabled={otpSent}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={
                      errors.confirmPassword ? "confirmPassword-error" : undefined
                    }
                    onChange={handleChange}
                  />
                  {errors.confirmPassword ? (
                    <p className="register-form__error" id="confirmPassword-error">
                      {errors.confirmPassword}
                    </p>
                  ) : null}
                </div>
              </div>

              {otpSent && (
                <div className="register-form__group">
                  <label htmlFor="otp">Enter 6-digit Verification OTP</label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    value={formData.otp}
                    placeholder="e.g. 123456"
                    aria-invalid={Boolean(errors.otp)}
                    aria-describedby={errors.otp ? "otp-error" : undefined}
                    onChange={handleChange}
                  />
                  {errors.otp ? (
                    <p className="register-form__error" id="otp-error">
                      {errors.otp}
                    </p>
                  ) : null}
                </div>
              )}

              <div className="register-form__terms-group">
                <label className="register-form__terms">
                  <input
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    disabled={otpSent}
                    aria-invalid={Boolean(errors.acceptTerms)}
                    aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined}
                    onChange={handleChange}
                  />
                  <span>
                    I accept the{" "}
                    <Link to="/terms-conditions" className="register-form__link">
                      Terms & Conditions
                    </Link>
                  </span>
                </label>

                {errors.acceptTerms ? (
                  <p className="register-form__error" id="acceptTerms-error">
                    {errors.acceptTerms}
                  </p>
                ) : null}
              </div>

              {!otpSent ? (
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={isOtpSending}
                  disabled={isOtpSending}
                >
                  Send Verification OTP
                </Button>
              ) : (
                <>
                  <div className="register-otp-actions" style={{ display: "flex", gap: "1rem" }}>
                    <Button
                      type="button"
                      variant="outline"
                      size="large"
                      fullWidth
                      onClick={() => setOtpSent(false)}
                    >
                      Change Details
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="large"
                      fullWidth
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Verify & Register
                    </Button>
                  </div>
                  <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <button
                      type="button"
                      className="register-form__link"
                      style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
                      disabled={isOtpSending}
                      onClick={handleResendOTP}
                    >
                      {isOtpSending ? "Resending OTP..." : "Didn't receive code? Resend OTP"}
                    </button>
                  </div>
                </>
              )}

              <p className="register-form__footer-text">
                Already have an account?{" "}
                <Link to="/login" className="register-form__link">
                  Login
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

export default Register;