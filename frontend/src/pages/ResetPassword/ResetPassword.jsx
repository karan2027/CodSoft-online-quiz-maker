import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import * as authService from "../../services/authService";

import "./ResetPassword.css";

const initialFormData = {
  newPassword: "",
  confirmPassword: "",
};

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const otp = location.state?.otp;

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Protect page from direct navigation without credentials
  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, otp, navigate]);

  const passwordStrength = useMemo(() => {
    const password = formData.newPassword;

    if (!password) {
      return { label: "", className: "" };
    }

    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z\d]/.test(password)) score += 1;

    if (score <= 2) {
      return { label: "Weak", className: "reset-password-form__strength--weak" };
    }

    if (score <= 4) {
      return { label: "Medium", className: "reset-password-form__strength--medium" };
    }

    return { label: "Strong", className: "reset-password-form__strength--strong" };
  }, [formData.newPassword]);

  const validateForm = () => {
    const validationErrors = {};
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;

    if (!formData.newPassword) {
      validationErrors.newPassword = "New password is required.";
    } else if (!strongPasswordRegex.test(formData.newPassword)) {
      validationErrors.newPassword =
        "Password must be 8-30 characters with uppercase, lowercase, number and special character (@$!%*?&).";
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = "Confirm password is required.";
    } else if (formData.confirmPassword !== formData.newPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    return validationErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
      form: "",
    }));

    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);
    setSuccessMessage("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    const result = await authService.resetPassword(email, otp, formData.newPassword);
    setIsLoading(false);

    if (!result.success) {
      setErrors({ form: result.message || "Password reset failed. Please try again." });
      return;
    }

    setSuccessMessage("Your password has been reset successfully.");

    window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1000);
  };

  if (!email || !otp) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="reset-password-page">
        <section
          className="reset-password-page__section"
          aria-labelledby="reset-password-title"
        >
          <div className="reset-password-card">
            <div className="reset-password-card__header">
              <p className="reset-password-card__eyebrow">Secure Account</p>
              <h1 id="reset-password-title">Reset Password</h1>
              <p>Create a strong new password for your Online Quiz Maker account.</p>
            </div>

            <form className="reset-password-form" noValidate onSubmit={handleSubmit}>
              {errors.form ? (
                <p className="reset-password-form__error" role="alert">
                  {errors.form}
                </p>
              ) : null}

              <div className="reset-password-form__group">
                <label htmlFor="newPassword">New Password</label>
                <div className="reset-password-form__password-field">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.newPassword)}
                    aria-describedby={
                      errors.newPassword ? "newPassword-error" : "password-strength"
                    }
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="reset-password-form__password-toggle"
                    aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                    onClick={() => setShowNewPassword((currentValue) => !currentValue)}
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {passwordStrength.label ? (
                  <div
                    className="reset-password-form__strength"
                    id="password-strength"
                    aria-live="polite"
                  >
                    <span className={passwordStrength.className} />
                    <p>
                      Password strength: <strong>{passwordStrength.label}</strong>
                    </p>
                  </div>
                ) : null}

                {errors.newPassword ? (
                  <p className="reset-password-form__error" id="newPassword-error">
                    {errors.newPassword}
                  </p>
                ) : null}
              </div>

              <div className="reset-password-form__group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="reset-password-form__password-field">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={
                      errors.confirmPassword ? "confirmPassword-error" : undefined
                    }
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="reset-password-form__password-toggle"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() =>
                      setShowConfirmPassword((currentValue) => !currentValue)
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errors.confirmPassword ? (
                  <p className="reset-password-form__error" id="confirmPassword-error">
                    {errors.confirmPassword}
                  </p>
                ) : null}
              </div>

              {successMessage ? (
                <p className="reset-password-form__success" role="status">
                  {successMessage}
                </p>
              ) : null}

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                Reset Password
              </Button>

              <p className="reset-password-form__footer-text">
                Remember your password?{" "}
                <Link to="/login" className="reset-password-form__link">
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

export default ResetPassword;