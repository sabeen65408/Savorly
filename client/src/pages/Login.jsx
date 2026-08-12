import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =====================================
  // HANDLE INPUT CHANGE
  // =====================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // =====================================
  // HANDLE LOGIN
  // =====================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // ---------------------------------
    // BASIC VALIDATION
    // ---------------------------------

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setIsSubmitting(true);

      // ---------------------------------
      // LOGIN API
      // ---------------------------------

      const data = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      // ---------------------------------
      // LOGIN FAILED
      // ---------------------------------

      if (!data?.success) {
        setError(
          data.message ||
            "Invalid email or password."
        );

        return;
      }

      // ---------------------------------
      // LOGIN SUCCESS
      // ---------------------------------

      navigate(location.state?.from || "/", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "Login failed:",
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
      ================================== */}

      <div className="auth-brand">

        <Link
          to="/"
          className="auth-logo"
        >
          <span className="logo-icon">
            S
          </span>

          <span>
            Savorly
          </span>
        </Link>

        <div className="auth-brand-content">

          <span className="eyebrow">
            WELCOME BACK
          </span>

          <h1>
            Your next delicious
            <br />
            recipe is waiting.
          </h1>

          <p>
            Sign in to save your favorite
            recipes and build your personal
            collection.
          </p>

        </div>

      </div>


      {/* =================================
          LOGIN FORM
      ================================== */}

      <div className="auth-form-wrapper">

        <div className="auth-form-container">

          <Link
            to="/"
            className="auth-back-link"
          >
            <ArrowLeft size={17} />
            Back to home
          </Link>


          <div className="auth-heading">

            <div className="auth-icon">
              <LogIn size={22} />
            </div>

            <span className="eyebrow">
              SIGN IN
            </span>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue to Savorly.
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
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />

            </div>


            {/* PASSWORD */}

            <div className="form-field">

              <div className="label-row">

                <label htmlFor="password">
                  Password
                </label>

                <Link
  to="/forgot-password"
  className="forgot-password"
>
  Forgot password?
</Link>

              </div>


              <div className="password-input">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
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


            {/* ERROR */}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >

              {isSubmitting
                ? "Signing in..."
                : "Sign in"}

            </button>


          </form>


          {/* REGISTER */}

          <div className="auth-switch">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;
