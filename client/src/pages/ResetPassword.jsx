import { useState } from "react";
import { API_BASE_URL } from "../api/client";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    // ---------------------------------
    // VALIDATION
    // ---------------------------------

    if (!password) {
      setError(
        "Please enter a new password."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        "Please confirm your new password."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // ---------------------------------
      // RESET PASSWORD API
      // ---------------------------------

      const response = await fetch(
        `${API_BASE_URL}/auth/reset-password/${token}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            password,
          }),
        }
      );

      const data =
        await response.json();

      // ---------------------------------
      // FAILED
      // ---------------------------------

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.message ||
            "Unable to reset password."
        );

        return;
      }

      // ---------------------------------
      // SUCCESS
      // ---------------------------------

      setMessage(
        "Password reset successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 2000);

    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">

      {/* =================================
          LEFT / BRAND
      ================================= */}

      <div className="auth-brand">

        <Link
          to="/"
          className="auth-logo"
        >
          <span className="logo-icon">
            S
          </span>

          <span>Savorly</span>
        </Link>

        <div className="auth-brand-content">

          <span className="eyebrow">
            NEW PASSWORD
          </span>

          <h1>
            One last step
            <br />
            and you're in.
          </h1>

          <p>
            Create a new password for your
            Savorly account and get back to
            discovering delicious recipes.
          </p>

        </div>

      </div>

      {/* =================================
          FORM
      ================================= */}

      <div className="auth-form-wrapper">

        <div className="auth-form-container">

          <Link
            to="/login"
            className="auth-back-link"
          >
            <ArrowLeft size={17} />
            Back to login
          </Link>

          <div className="auth-heading">

            <div className="auth-icon">
              <Lock size={22} />
            </div>

            <span className="eyebrow">
              RESET PASSWORD
            </span>

            <h2>
              Create new password
            </h2>

            <p>
              Choose a new password for
              your account.
            </p>

          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* PASSWORD */}

            <div className="form-field">

              <label htmlFor="password">
                New password
              </label>

              <div className="password-input">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value
                    );
                    setError("");
                  }}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="form-field">

              <label htmlFor="confirmPassword">
                Confirm new password
              </label>

              <div className="password-input">

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value
                    );
                    setError("");
                  }}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {message && (
              <div className="auth-success">
                <CheckCircle size={17} />
                <span>{message}</span>
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Updating password..."
                : "Update password"}
            </button>

          </form>

          <div className="auth-switch">

            <span>
              Remember your password?
            </span>

            <Link to="/login">
              Sign in
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ResetPassword;