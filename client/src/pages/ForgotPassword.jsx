import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  CheckCircle,
} from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

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

    if (!email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // ---------------------------------
      // API
      // ---------------------------------

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to process your request."
        );

        return;
      }

      setMessage(data.message);
    } catch (error) {
      console.error(
        "Forgot password error:",
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
          LEFT / BRAND SECTION
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
            PASSWORD RECOVERY
          </span>

          <h1>
            Let's get you
            <br />
            back to cooking.
          </h1>

          <p>
            Enter your email address and
            we'll send you a secure link
            to create a new password.
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
              <Mail size={22} />
            </div>

            <span className="eyebrow">
              FORGOT PASSWORD
            </span>

            <h2>
              Reset your password
            </h2>

            <p>
              Enter the email associated
              with your Savorly account.
            </p>

          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="form-field">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                  setMessage("");
                }}
                autoComplete="email"
              />

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
                ? "Sending..."
                : "Send reset link"}
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

export default ForgotPassword;