import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { useQuiz } from "../../context/QuizContext";
import * as quizService from "../../services/quizService";

import "./CreateQuiz.css";

const OPTION_LABELS = ["A", "B", "C", "D"];

const initialQuestion = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "", // will hold a number index (0-3) once selected
  marks: 1,
};

const initialFormData = {
  title: "",
  description: "Created via QuizBuilder",
  category: "General",
  difficulty: "medium",
  timeLimit: "",
  isPublic: true,
  allowMultipleAttempts: false,
  protection: "public",
  password: "",
};

function CreateQuiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { createQuiz, loading } = useQuiz();

  const isEditMode = Boolean(quizId);

  const [formData, setFormData] = useState(initialFormData);
  const [questions, setQuestions] = useState([{ ...initialQuestion }]);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchQuiz = async () => {
        setSubmitting(true);
        const result = await quizService.getQuizById(quizId);
        if (result.success && result.data) {
          const quiz = result.data;
          setFormData({
            title: quiz.title || "",
            description: quiz.description || "Created via QuizBuilder",
            category: quiz.category || "General",
            difficulty: quiz.difficulty || "medium",
            timeLimit: String(quiz.timeLimit || ""),
            isPublic: quiz.isPublic === undefined ? true : quiz.isPublic,
            allowMultipleAttempts: quiz.allowMultipleAttempts || false,
            protection: quiz.password ? "protected" : "public",
            password: quiz.password || "",
          });
          setQuestions(
            quiz.questions && quiz.questions.length > 0
              ? quiz.questions.map((q) => ({
                  _id: q._id,
                  questionText: q.questionText || "",
                  options: q.options || ["", "", "", ""],
                  correctAnswer: q.correctAnswer !== undefined ? String(q.correctAnswer) : "",
                  marks: q.marks || 1,
                }))
              : [{ ...initialQuestion }]
          );
        } else {
          setStatusMessage(result.message || "Failed to load quiz details.");
        }
        setSubmitting(false);
      };
      fetchQuiz();
    }
  }, [quizId, isEditMode]);

  const totalMarks = useMemo(
    () =>
      questions.reduce((total, question) => {
        const marks = Number(question.marks) || 0;
        return total + marks;
      }, 0),
    [questions]
  );

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setStatusMessage("");
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) =>
        index === questionIndex ? { ...question, [field]: value } : question
      )
    );

    setErrors((currentErrors) => ({
      ...currentErrors,
      questions: "",
    }));

    setStatusMessage("");
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        const updatedOptions = [...question.options];
        updatedOptions[optionIndex] = value;

        return {
          ...question,
          options: updatedOptions,
        };
      })
    );

    setErrors((currentErrors) => ({
      ...currentErrors,
      questions: "",
    }));

    setStatusMessage("");
  };

  const addQuestion = () => {
    setQuestions((currentQuestions) => [
      ...currentQuestions,
      { ...initialQuestion, options: ["", "", "", ""] },
    ]);
  };

  const deleteQuestion = (questionIndex) => {
    if (questions.length === 1) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        questions: "At least one question is required.",
      }));
      return;
    }

    setQuestions((currentQuestions) =>
      currentQuestions.filter((_, index) => index !== questionIndex)
    );
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.title.trim() || formData.title.trim().length < 5) {
      validationErrors.title = "Title must be at least 5 characters.";
    }

    const timeLimitNum = Number(formData.timeLimit);
    if (
      !formData.timeLimit ||
      !Number.isInteger(timeLimitNum) ||
      timeLimitNum < 1 ||
      timeLimitNum > 300
    ) {
      validationErrors.timeLimit = "Time limit must be a whole number between 1 and 300 minutes.";
    }

    if (formData.protection === "protected" && (!formData.password || formData.password.trim().length < 4)) {
      validationErrors.password = "Password must be at least 4 characters.";
    }

    const hasInvalidQuestion = questions.some((question) => {
      const hasQuestionText = question.questionText.trim();
      const filledOptions = question.options.filter((option) => option.trim());
      const hasEnoughOptions = filledOptions.length >= 2;
      const hasCorrectAnswer = question.correctAnswer !== "";
      const hasValidMarks = Number(question.marks) > 0;

      return !hasQuestionText || !hasEnoughOptions || !hasCorrectAnswer || !hasValidMarks;
    });

    if (hasInvalidQuestion) {
      validationErrors.questions =
        "Each question needs text, at least two options, a correct answer and valid marks.";
    }

    return validationErrors;
  };

  const buildPayload = (status = "published") => ({
    title: formData.title.trim(),
    description: formData.description.trim(),
    category: formData.category.trim(),
    difficulty: formData.difficulty,
    timeLimit: Number(formData.timeLimit),
    isPublic: formData.protection === "public",
    allowMultipleAttempts: formData.allowMultipleAttempts,
    password: formData.protection === "protected" && formData.password.trim() ? formData.password.trim() : undefined,
    status, // Send draft or published status
    questions: questions.map((question) => ({
      questionText: question.questionText.trim(),
      options: question.options.filter((option) => option.trim()),
      correctAnswer: Number(question.correctAnswer),
      marks: Number(question.marks) || 1,
    })),
  });

  const handlePreview = () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatusMessage("");
      return;
    }

    setIsPreviewOpen(true);
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      setErrors({ title: "Title is required to save a draft." });
      return;
    }
    setStatusMessage("");
    setSubmitting(true);

    let result;
    if (isEditMode) {
      result = await quizService.updateQuiz(quizId, buildPayload("draft"));
    } else {
      result = await createQuiz(buildPayload("draft"));
    }

    if (!result.success) {
      setStatusMessage(result.message || "Unable to save draft.");
      setSubmitting(false);
      return;
    }

    setStatusMessage("Draft saved successfully.");
    setSubmitting(false);
    navigate("/dashboard");
  };

  const handlePublishClick = () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatusMessage("");
      return;
    }

    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    setIsPublishModalOpen(false);
    setStatusMessage("");
    setSubmitting(true);

    let result;
    if (isEditMode) {
      result = await quizService.updateQuiz(quizId, buildPayload("published"));
    } else {
      result = await createQuiz(buildPayload("published"));
    }

    if (!result.success) {
      setStatusMessage(result.message || (isEditMode ? "Unable to update quiz." : "Unable to create quiz."));

      // Map backend validation errors back onto fields
      if (Array.isArray(result.errors)) {
        const fieldErrors = {};
        result.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path] = err.msg;
          }
        });
        setErrors((currentErrors) => ({ ...currentErrors, ...fieldErrors }));
      }
      setSubmitting(false);
      return;
    }

    setStatusMessage(isEditMode ? "Quiz updated successfully." : "Quiz created successfully.");
    setSubmitting(false);
    navigate("/dashboard");
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setQuestions([{ ...initialQuestion, options: ["", "", "", ""] }]);
    setErrors({});
    setStatusMessage("");
  };

  return (
    <>
      <Navbar />

      <main className="create-quiz-page">
        <section className="create-quiz-hero" aria-labelledby="create-quiz-title">
          <div className="container">
            <p className="create-quiz-hero__eyebrow">Quiz Builder</p>
            <h1 id="create-quiz-title">{isEditMode ? "Edit Quiz" : "Create New Quiz"}</h1>
            <p>{isEditMode ? "Modify your quiz questions, details and settings." : "Build a complete quiz with settings, visibility and dynamic questions."}</p>
          </div>
        </section>

        <section className="create-quiz-section">
          <div className="container">
            <form className="create-quiz-form" noValidate>
              <section className="create-quiz-card" aria-labelledby="details-title">
                <div className="create-quiz-card__header">
                  <h2 id="details-title">Quiz Details</h2>
                  <p>Provide a title, time limit, attempt allowance, and protection settings.</p>
                </div>

                <div className="create-quiz-grid">
                  <div className="create-quiz-field create-quiz-field--wide">
                    <label htmlFor="title">Quiz Title</label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      placeholder="Enter quiz title (min 5 characters)"
                      aria-invalid={Boolean(errors.title)}
                      aria-describedby={errors.title ? "title-error" : undefined}
                      onChange={handleFieldChange}
                    />
                    {errors.title ? (
                      <p className="create-quiz-error" id="title-error">
                        {errors.title}
                      </p>
                    ) : null}
                  </div>

                  <div className="create-quiz-field">
                    <label htmlFor="timeLimit">Time Limit (minutes)</label>
                    <input
                      id="timeLimit"
                      name="timeLimit"
                      type="number"
                      step="1"
                      min="1"
                      max="300"
                      value={formData.timeLimit}
                      placeholder="30"
                      aria-invalid={Boolean(errors.timeLimit)}
                      aria-describedby={errors.timeLimit ? "timeLimit-error" : undefined}
                      onChange={handleFieldChange}
                    />
                    {errors.timeLimit ? (
                      <p className="create-quiz-error" id="timeLimit-error">
                        {errors.timeLimit}
                      </p>
                    ) : null}
                  </div>

                  <div className="create-quiz-field">
                    <label htmlFor="allowMultipleAttempts">Multiple Attempt</label>
                    <select
                      id="allowMultipleAttempts"
                      name="allowMultipleAttempts"
                      value={formData.allowMultipleAttempts ? "true" : "false"}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowMultipleAttempts: e.target.value === "true" }))}
                    >
                      <option value="false">Not allowed</option>
                      <option value="true">Allowed</option>
                    </select>
                  </div>

                  <div className="create-quiz-field">
                    <label htmlFor="protection">Protection</label>
                    <select
                      id="protection"
                      name="protection"
                      value={formData.protection}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ 
                          ...prev, 
                          protection: val, 
                          password: val === "public" ? "" : prev.password 
                        }));
                      }}
                    >
                      <option value="public">Public</option>
                      <option value="protected">Protected</option>
                    </select>
                  </div>

                  {formData.protection === "protected" ? (
                    <div className="create-quiz-field">
                      <label htmlFor="password">Password</label>
                      <input
                        id="password"
                        name="password"
                        type="text"
                        value={formData.password}
                        placeholder="At least 4 characters"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        onChange={handleFieldChange}
                      />
                      {errors.password ? (
                        <p className="create-quiz-error" id="password-error">
                          {errors.password}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="create-quiz-card" aria-labelledby="questions-title">
                <div className="create-quiz-card__header create-quiz-card__header--split">
                  <div>
                    <h2 id="questions-title">Questions</h2>
                    <p>Add questions, options, correct answers and marks.</p>
                  </div>
                  <span className="create-quiz-total-marks">Total Marks: {totalMarks}</span>
                </div>

                {errors.questions ? (
                  <p className="create-quiz-error create-quiz-error--block">
                    {errors.questions}
                  </p>
                ) : null}

                <div className="create-quiz-questions">
                  {questions.map((question, questionIndex) => (
                    <article className="create-quiz-question" key={`question-${questionIndex}`}>
                      <div className="create-quiz-question__header">
                        <h3>Question {questionIndex + 1}</h3>
                        <Button
                          type="button"
                          variant="danger"
                          size="small"
                          onClick={() => deleteQuestion(questionIndex)}
                        >
                          Delete Question
                        </Button>
                      </div>

                      <div className="create-quiz-field">
                        <label htmlFor={`question-${questionIndex}`}>Question Text</label>
                        <textarea
                          id={`question-${questionIndex}`}
                          value={question.questionText}
                          placeholder="Enter question text"
                          onChange={(event) =>
                            handleQuestionChange(questionIndex, "questionText", event.target.value)
                          }
                        />
                      </div>

                      <div className="create-quiz-options">
                        {question.options.map((option, optionIndex) => (
                          <div
                            className="create-quiz-field"
                            key={`question-${questionIndex}-option-${optionIndex}`}
                          >
                            <label htmlFor={`question-${questionIndex}-option-${optionIndex}`}>
                              Option {OPTION_LABELS[optionIndex]}
                            </label>
                            <input
                              id={`question-${questionIndex}-option-${optionIndex}`}
                              type="text"
                              value={option}
                              placeholder={`Enter option ${OPTION_LABELS[optionIndex]}`}
                              onChange={(event) =>
                                handleOptionChange(questionIndex, optionIndex, event.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>

                      <div className="create-quiz-grid create-quiz-grid--compact">
                        <div className="create-quiz-field">
                          <label htmlFor={`correct-${questionIndex}`}>Correct Answer</label>
                          <select
                            id={`correct-${questionIndex}`}
                            value={question.correctAnswer}
                            onChange={(event) =>
                              handleQuestionChange(
                                questionIndex,
                                "correctAnswer",
                                event.target.value
                              )
                            }
                          >
                            <option value="">Select correct answer</option>
                            {question.options.map((option, optionIndex) => (
                              <option key={optionIndex} value={optionIndex}>
                                Option {OPTION_LABELS[optionIndex]}
                                {option ? ` — ${option}` : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="create-quiz-field">
                          <label htmlFor={`marks-${questionIndex}`}>Marks</label>
                          <input
                            id={`marks-${questionIndex}`}
                            type="number"
                            min="1"
                            value={question.marks}
                            onChange={(event) =>
                              handleQuestionChange(questionIndex, "marks", event.target.value)
                            }
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="create-quiz-add-question">
                  <Button type="button" variant="outline" size="medium" onClick={addQuestion}>
                    Add Question
                  </Button>
                </div>
              </section>

              {statusMessage ? (
                <p className="create-quiz-status" role="status">
                  {statusMessage}
                </p>
              ) : null}

              <div className="create-quiz-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="large"
                  onClick={handlePreview}
                  disabled={loading || submitting}
                >
                  Preview Quiz
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="large"
                  onClick={handleSaveDraft}
                  disabled={loading || submitting}
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="large"
                  onClick={handlePublishClick}
                  disabled={loading || submitting}
                >
                  {submitting ? "Processing..." : isEditMode ? "Update Quiz" : "Publish Quiz"}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="large"
                  onClick={handleReset}
                  disabled={loading || submitting}
                >
                  Reset Form
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={formData.title || "Quiz Preview"}
        size="large"
      >
        <p>{formData.description}</p>
        <p>
          <strong>Category:</strong> {formData.category} &nbsp;|&nbsp;
          <strong> Difficulty:</strong> {formData.difficulty} &nbsp;|&nbsp;
          <strong> Time Limit:</strong> {formData.timeLimit} min &nbsp;|&nbsp;
          <strong> Total Marks:</strong> {totalMarks}
        </p>
        <hr />
        {questions.map((question, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <p>
              <strong>
                Q{index + 1}. {question.questionText}
              </strong>
            </p>
            <ul>
              {question.options.map((option, optionIndex) => (
                <li
                  key={optionIndex}
                  style={{
                    fontWeight:
                      String(optionIndex) === String(question.correctAnswer) ? "bold" : "normal",
                  }}
                >
                  {OPTION_LABELS[optionIndex]}. {option}
                  {String(optionIndex) === String(question.correctAnswer) ? " (correct)" : ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Modal>

      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Quiz?"
        size="small"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPublishModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmPublish}
              disabled={loading}
            >
              {loading ? "Publishing..." : "Confirm Publish"}
            </Button>
          </>
        }
      >
        <p>
          This quiz will be published with {questions.length} questions and {totalMarks} total
          marks.
        </p>
      </Modal>

      <Footer />
    </>
  );
}

export default CreateQuiz;
