import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { useQuiz } from "../../context/QuizContext";

import "./QuizAttempt.css";

const OPTION_LABELS = ["A", "B", "C", "D"];

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const {
    selectedQuiz,
    loadQuiz,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    answers,
    timer,
    isQuizStarted,
    startQuiz,
    goToQuestion,
    previousQuestion,
    nextQuestion,
    selectAnswer,
    submitQuiz,
    updateTimer,
    loading,
    error,
  } = useQuiz();

  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const startedAtRef = useRef(null);

  // Load the real quiz from the backend on mount / when quizId changes
  useEffect(() => {
    if (quizId) {
      loadQuiz(quizId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  // Once the quiz has loaded, start the attempt (resets timer/answers/state)
  useEffect(() => {
    if (selectedQuiz && !isQuizStarted && !isSubmitted) {
      startQuiz();
      startedAtRef.current = Date.now();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuiz]);

  useEffect(() => {
    setVisitedQuestions((currentVisited) => {
      const updatedVisited = new Set(currentVisited);
      updatedVisited.add(currentQuestionIndex);
      return updatedVisited;
    });
  }, [currentQuestionIndex]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isSubmitted) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitted]);

  // Countdown timer — ticks down the shared context timer
  useEffect(() => {
    if (!isQuizStarted || isSubmitted) {
      return undefined;
    }

    if (timer <= 0) {
      handleFinalSubmit();
      return undefined;
    }

    const timerId = window.setInterval(() => {
      updateTimer((previous) => previous - 1);
    }, 1000);

    return () => window.clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, isQuizStarted, isSubmitted]);

  const answeredCount = Object.keys(answers).length;
  const notAnsweredCount = visitedQuestions.size - answeredCount;

  const paletteItems = useMemo(() => {
    if (!selectedQuiz) return [];

    return selectedQuiz.questions.map((question, index) => {
      const isCurrent = index === currentQuestionIndex;
      const isAnswered = answers[question._id] !== undefined;
      const isVisited = visitedQuestions.has(index);

      if (isCurrent) return "current";
      if (isAnswered) return "answered";
      if (isVisited) return "not-answered";
      return "not-visited";
    });
  }, [selectedQuiz, answers, currentQuestionIndex, visitedQuestions]);

  const handleSelectOption = (optionIndex) => {
    if (!currentQuestion) return;
    selectAnswer(currentQuestion._id, optionIndex);
  };

  const handleFinalSubmit = async () => {
    if (isSubmitted) return; // guard against double-submit (timer + manual click)

    setIsSubmitted(true);
    setIsSubmitModalOpen(false);

    const elapsedSeconds = startedAtRef.current
      ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
      : Math.max(1, (selectedQuiz?.timeLimit || 0) * 60 - timer);

    const result = await submitQuiz(elapsedSeconds);

    if (result.success) {
      navigate(`/result/${result.data.resultId}`, { replace: true });
    } else {
      // Submission failed (e.g. already submitted, quiz not published) —
      // let the person see the error instead of navigating away silently.
      setIsSubmitted(false);
    }
  };

  if (loading && !selectedQuiz) {
    return (
      <>
        <Navbar />
        <main className="quiz-attempt-page">
          <div className="container">
            <p>Loading quiz...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error && !selectedQuiz) {
    return (
      <>
        <Navbar />
        <main className="quiz-attempt-page">
          <div className="container">
            <p role="alert">{error}</p>
            <Button variant="primary" onClick={() => navigate("/all-quizzes")}>
              Back to All Quizzes
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!selectedQuiz || !currentQuestion) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="quiz-attempt-page">
        <section className="quiz-attempt-hero" aria-labelledby="quiz-attempt-title">
          <div className="container">
            <div className="quiz-attempt-hero__content">
              <p className="quiz-attempt-hero__eyebrow">Quiz Attempt</p>
              <h1 id="quiz-attempt-title">{selectedQuiz.title}</h1>

              <div className="quiz-attempt-meta" aria-label="Quiz details">
                <span>{selectedQuiz.category}</span>
                <span>{selectedQuiz.difficulty}</span>
                <span>{totalQuestions} Questions</span>
                <span>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>
            </div>

            <div className="quiz-attempt-timer" aria-live="polite">
              <span>Time Remaining</span>
              <strong>{formatTime(timer)}</strong>
            </div>
          </div>
        </section>

        <section className="quiz-attempt-section">
          <div className="container">
            {error ? (
              <p className="quiz-attempt-error" role="alert" style={{ marginBottom: "1rem" }}>
                {error}
              </p>
            ) : null}

            <div className="quiz-attempt-layout">
              <article className="quiz-question-card" aria-labelledby="question-title">
                <div className="quiz-question-card__top">
                  <div>
                    <p className="quiz-question-card__label">
                      Question {currentQuestionIndex + 1}
                    </p>
                    <h2 id="question-title">{currentQuestion.questionText}</h2>
                  </div>

                  <div className="quiz-question-card__progress">
                    <span>{currentQuestionIndex + 1}</span>
                    <small>/ {totalQuestions}</small>
                  </div>
                </div>

                <fieldset className="quiz-options">
                  <legend className="quiz-options__legend">Select one answer</legend>

                  {currentQuestion.options.map((option, optionIndex) => {
                    const optionLabel = OPTION_LABELS[optionIndex];
                    const inputId = `${currentQuestion._id}-${optionLabel}`;
                    const isSelected = answers[currentQuestion._id] === optionIndex;

                    return (
                      <label
                        className={isSelected ? "quiz-option quiz-option--selected" : "quiz-option"}
                        htmlFor={inputId}
                        key={inputId}
                      >
                        <input
                          id={inputId}
                          type="radio"
                          name={currentQuestion._id}
                          value={optionIndex}
                          checked={isSelected}
                          onChange={() => handleSelectOption(optionIndex)}
                        />
                        <span className="quiz-option__letter">{optionLabel}</span>
                        <span className="quiz-option__text">{option}</span>
                      </label>
                    );
                  })}
                </fieldset>

                <div className="quiz-question-card__actions">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentQuestionIndex === 0}
                    onClick={previousQuestion}
                  >
                    Previous Question
                  </Button>

                  {currentQuestionIndex === totalQuestions - 1 ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setIsSubmitModalOpen(true)}
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button type="button" variant="primary" onClick={nextQuestion}>
                      Next Question
                    </Button>
                  )}
                </div>
              </article>

              <aside className="quiz-palette" aria-labelledby="palette-title">
                <div className="quiz-palette__header">
                  <h2 id="palette-title">Question Palette</h2>
                  <p>{answeredCount} answered</p>
                </div>

                <div className="quiz-palette__grid">
                  {paletteItems.map((status, index) => (
                    <button
                      key={`palette-${index + 1}`}
                      type="button"
                      className={`quiz-palette__item quiz-palette__item--${status}`}
                      aria-label={`Go to question ${index + 1}, ${status.replace("-", " ")}`}
                      aria-current={index === currentQuestionIndex ? "step" : undefined}
                      onClick={() => goToQuestion(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <dl className="quiz-palette__summary">
                  <div>
                    <dt>Answered</dt>
                    <dd>{answeredCount}</dd>
                  </div>
                  <div>
                    <dt>Not Answered</dt>
                    <dd>{notAnsweredCount}</dd>
                  </div>
                  <div>
                    <dt>Not Visited</dt>
                    <dd>{totalQuestions - visitedQuestions.size}</dd>
                  </div>
                </dl>

                <ul className="quiz-palette__legend" aria-label="Palette legend">
                  <li><span className="legend legend--current" /> Current</li>
                  <li><span className="legend legend--answered" /> Answered</li>
                  <li><span className="legend legend--not-answered" /> Not Answered</li>
                  <li><span className="legend legend--not-visited" /> Not Visited</li>
                </ul>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Quiz?"
        size="small"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
              Continue Attempt
            </Button>
            <Button type="button" variant="primary" onClick={handleFinalSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Quiz"}
            </Button>
          </>
        }
      >
        <p>
          You have answered {answeredCount} out of {totalQuestions} questions.
          Once submitted, this attempt will be completed.
        </p>
      </Modal>

      <Footer />
    </>
  );
}

export default QuizAttempt;
