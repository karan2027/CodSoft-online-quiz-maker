import "./QuizCard.css";

function QuizCard({
  quizId,
  quizCode,
  title,
  description,
  category,
  subCategory,
  difficulty = "Easy",
  totalQuestions = 0,
  estimatedTime = "0 min",
  createdBy,
  totalAttempts = 0,
  averageScore = 0,
  thumbnail,
  isPrivate = false,
  passwordProtected = false,
  tags = [],
  onStartQuiz,
  actionText = "Start Quiz",
  onAction,
  className = "",
}) {
  const cardClasses = ["quiz-card", className].filter(Boolean).join(" ");
  const normalizedDifficulty = String(difficulty).toLowerCase();

  const handleStartQuiz = () => {
    if (onAction) {
      onAction(quizCode || quizId);
    } else if (onStartQuiz) {
      onStartQuiz(quizCode || quizId);
    }
  };

  return (
    <article className={cardClasses} aria-labelledby={`quiz-title-${quizId}`}>
      <div className="quiz-card__media">
        {thumbnail ? (
          <img className="quiz-card__image" src={thumbnail} alt={`${title} quiz`} />
        ) : (
          <div className="quiz-card__placeholder" aria-hidden="true">
            <span>Quiz</span>
          </div>
        )}

        <div className="quiz-card__badges" aria-label="Quiz visibility">
          {isPrivate ? (
            <span className="quiz-card__badge quiz-card__badge--private">
              Private Quiz
            </span>
          ) : (
            <span className="quiz-card__badge quiz-card__badge--public">
              Public Quiz
            </span>
          )}

          {passwordProtected ? (
            <span className="quiz-card__badge quiz-card__badge--protected">
              Password Protected
            </span>
          ) : null}
        </div>
      </div>

      <div className="quiz-card__body">
        <div className="quiz-card__content">
          <h3 className="quiz-card__title" id={`quiz-title-${quizId}`}>
            {title}
          </h3>

          <p className="quiz-card__description">{description}</p>

          <div className="quiz-card__meta">
            <span>{category}</span>
            <span aria-hidden="true">•</span>
            <span>{subCategory}</span>
          </div>

          {tags.length > 0 ? (
            <ul className="quiz-card__tags" aria-label="Quiz tags">
              {tags.slice(0, 4).map((tag) => (
                <li className="quiz-card__tag" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <dl className="quiz-card__info">
          <div className="quiz-card__info-item">
            <dt>Difficulty</dt>
            <dd>
              <span
                className={`quiz-card__difficulty quiz-card__difficulty--${normalizedDifficulty}`}
              >
                {difficulty}
              </span>
            </dd>
          </div>

          <div className="quiz-card__info-item">
            <dt>Questions</dt>
            <dd>{totalQuestions}</dd>
          </div>

          <div className="quiz-card__info-item">
            <dt>Time</dt>
            <dd>{estimatedTime}</dd>
          </div>

          <div className="quiz-card__info-item">
            <dt>Attempts</dt>
            <dd>{totalAttempts}</dd>
          </div>

          <div className="quiz-card__info-item">
            <dt>Avg. Score</dt>
            <dd>{averageScore}%</dd>
          </div>

          <div className="quiz-card__info-item">
            <dt>Created By</dt>
            <dd>{createdBy}</dd>
          </div>
        </dl>

        <div className="quiz-card__footer" style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <button
            type="button"
            className="quiz-card__start-button"
            onClick={handleStartQuiz}
            style={{ flex: 1, minWidth: "80px" }}
          >
            {actionText}
          </button>

          <button
            type="button"
            className="quiz-card__share-button"
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
            onClick={(e) => {
              e.stopPropagation();
              const shareLink = `${window.location.origin}/quiz-details/${quizCode || quizId}`;
              navigator.clipboard.writeText(shareLink);
              alert(`Link copied to clipboard! You can now paste and share this in WhatsApp or other groups:\n${shareLink}`);
            }}
          >
            Share
          </button>

          <code 
            className="quiz-card__id" 
            title="Click to copy Code" 
            style={{ 
              display: "block", 
              width: "100%", 
              textAlign: "right", 
              marginTop: "0.5rem", 
              color: "var(--color-text-muted)",
              cursor: "pointer",
              userSelect: "all"
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(quizCode || quizId);
              alert(`Code copied to clipboard: ${quizCode || quizId}`);
            }}
          >
            Code: {quizCode || quizId} (Click to copy)
          </code>
        </div>
      </div>
    </article>
  );
}

export default QuizCard;