import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import * as authService from "../../services/authService";

import "./VerifyOTP.css";

const OTP_LENGTH = 6;
const TIMER_SECONDS = 60;

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = useRef([]);

  const otp = otpValues.join("");


  // Protect page from direct navigation without email
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer === 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTimer((currentTimer) => currentTimer - 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timer]);

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
  };

  const updateOtpValue = (index, value) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    setOtpValues((currentValues) => {
      const updatedValues = [...currentValues];
      updatedValues[index] = value;
      return updatedValues;
    });

    setError("");
    setSuccessMessage("");

    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleInputChange = (index, event) => {
    const value = event.target.value.slice(-1);
    updateOtpValue(index, value);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedValue) {
      return;
    }

    const nextValues = Array(OTP_LENGTH).fill("");

    pastedValue.split("").forEach((digit, index) => {
      nextValues[index] = digit;
    });

    setOtpValues(nextValues);
    setError("");
    setSuccessMessage("");

    focusInput(Math.min(pastedValue.length, OTP_LENGTH) - 1);
  };

  const validateOtp = () => {
    if (!otp) {
      return "OTP is required.";
    }

    if (!/^\d{6}$/.test(otp)) {
      return "OTP must contain exactly 6 digits.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateOtp();
    setError(validationError);
    setSuccessMessage("");

    if (validationError) {
      return;
    }

    setIsLoading(true);

    const result = await authService.verifyOTP(email, otp);
    setIsLoading(false);

    if (!result.success) {
      setError(result.message || "OTP verification failed. Please try again.");
      return;
    }

    setSuccessMessage("OTP verified successfully.");

    window.setTimeout(() => {
      navigate("/reset-password", { replace: true, state: { email, otp } });
    }, 1000);
  };

  const handleResendOtp = async () => {
    setOtpValues(Array(OTP_LENGTH).fill(""));
    setError("");
    setSuccessMessage("");

    const result = await authService.forgotPassword(email);
    if (result.success) {
      setTimer(TIMER_SECONDS);
      setSuccessMessage("A new OTP has been sent to your registered email address.");
      focusInput(0);
    } else {
      setError(result.message || "Failed to resend OTP. Please try again.");
    }
  };

  if (!email) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="verify-otp-page">
        <section className="verify-otp-page__section" aria-labelledby="verify-otp-title">
          <div className="verify-otp-card">
            <div className="verify-otp-card__header">
              <p className="verify-otp-card__eyebrow">OTP Verification</p>
              <h1 id="verify-otp-title">Verify your OTP</h1>
              <p>Enter the 6-digit code sent to your registered email address.</p>
            </div>

            <form className="verify-otp-form" noValidate onSubmit={handleSubmit}>
              <fieldset className="verify-otp-form__fieldset">
                <legend className="verify-otp-form__legend">
                  Enter 6-digit OTP
                </legend>

                <div className="verify-otp-form__inputs">
                  {otpValues.map((value, index) => (
                    <input
                      key={`otp-${index + 1}`}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      className="verify-otp-form__input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="1"
                      value={value}
                      aria-label={`OTP digit ${index + 1}`}
                      aria-invalid={Boolean(error)}
                      onChange={(event) => handleInputChange(index, event)}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      onPaste={index === 0 ? handlePaste : undefined}
                    />
                  ))}
                </div>
              </fieldset>

              <div className="verify-otp-form__status">
                {timer > 0 ? (
                  <p>Resend OTP in {timer}s</p>
                ) : (
                  <button
                    type="button"
                    className="verify-otp-form__resend"
                    onClick={handleResendOtp}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {error ? (
                <p className="verify-otp-form__error" role="alert">
                  {error}
                </p>
              ) : null}

              {successMessage ? (
                <p className="verify-otp-form__success" role="status">
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
                Verify OTP
              </Button>

              <p className="verify-otp-form__footer-text">
                Entered the wrong email?{" "}
                <Link to="/forgot-password" className="verify-otp-form__link">
                  Go back
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

export default VerifyOTP;