import "./Button.css";

function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = "",
  ...restProps
}) {
  const isDisabled = disabled || loading;

  const buttonClasses = [
    "custom-button",
    `custom-button--${variant}`,
    `custom-button--${size}`,
    fullWidth ? "custom-button--full-width" : "",
    loading ? "custom-button--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...restProps}
    >
      {!loading && leftIcon ? (
        <span className="custom-button__icon custom-button__icon--left">
          {leftIcon}
        </span>
      ) : null}

      <span className="custom-button__text">
        {loading ? "Loading..." : children}
      </span>

      {!loading && rightIcon ? (
        <span className="custom-button__icon custom-button__icon--right">
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
}

export default Button;