import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";

import "./Login.css";

const initialFormData = {
  email: "",
  password: "",
  rememberMe: false,
};

function Login() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const validateForm = () => {
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      validationErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      validationErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      validationErrors.password = "Password is required.";
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
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    const result = await login(formData.email.trim(), formData.password);

    setIsLoading(false);

    if (!result.success) {
      setErrors({ form: result.message });
      return;
    }

    navigate(redirectPath, { replace: true });
  };

  return (
    <>
      <Navbar />

      <main className="login-page">
        <section className="login-page__section" aria-labelledby="login-title">
          <div className="login-card">
            <div className="login-card__header">
              <p className="login-card__eyebrow">Welcome Back</p>
              <h1 id="login-title">Login to your account</h1>
              <p>Continue creating quizzes, tracking attempts and improving skills.</p>
            </div>

            <form className="login-form" noValidate onSubmit={handleSubmit}>
              {errors.form ? (
                <p className="login-form__error" role="alert">
                  {errors.form}
                </p>
              ) : null}

              <div className="login-form__group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  placeholder="Enter your email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  onChange={handleChange}
                />
                {errors.email ? (
                  <p className="login-form__error" id="email-error">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className="login-form__group">
                <label htmlFor="password">Password</label>
                <div className="login-form__password-field">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="login-form__password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password ? (
                  <p className="login-form__error" id="password-error">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              <div className="login-form__options">
                <label className="login-form__remember">
                  <input
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember Me</span>
                </label>

                <Link to="/forgot-password" className="login-form__link">
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                Login
              </Button>

              <p className="login-form__footer-text">
                Do not have an account?{" "}
                <Link to="/register" className="login-form__link">
                  Register
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

export default Login;