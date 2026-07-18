import "./Loader.css";

function Loader({
  size = "medium",
  text = "",
  fullScreen = false,
  overlay = false,
  className = "",
}) {
  const loaderClasses = [
    "loader",
    `loader--${size}`,
    fullScreen ? "loader--full-screen" : "",
    overlay ? "loader--overlay" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={loaderClasses} role="status" aria-live="polite" aria-busy="true">
      <div className="loader__spinner" aria-hidden="true" />
      {text ? <p className="loader__text">{text}</p> : null}
      <span className="loader__sr-only">Loading</span>
    </div>
  );
}

export default Loader;