import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const passwordValid =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password);

    /* =========================================================
       VALIDATION
    ========================================================= */

    if (!cleanName || !cleanEmail || !password) {
      setError("Please fill all fields.");
      return;
    }

    if (!passwordValid) {
      setError(
        "Password must contain 8+ characters, uppercase, lowercase and a number."
      );
      return;
    }

    /* =========================================================
       SIGNUP
    ========================================================= */

    try {
      const response = await fetch(
        "http://10.45.196.65:8000/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password: password,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      /* =======================================================
         BACKEND ERROR
      ======================================================= */

      if (!response.ok) {
        setError(
          data.detail ||
            data.message ||
            "Unable to create account. Please try again."
        );

        return;
      }

      /* =======================================================
         SAVE USER LOCALLY

         Important:
         Backend may return user without name.
         So we always make sure the entered name is saved.
      ======================================================= */

      const savedUser = {
        ...(data.user || {}),

        name:
          data.user?.name ||
          cleanName,

        email:
          data.user?.email ||
          cleanEmail,
      };

      localStorage.setItem(
        "pulseiq_user",
        JSON.stringify(savedUser)
      );

      /* =======================================================
         LOGIN STATUS
      ======================================================= */

      localStorage.setItem(
        "pulseiq_logged_in",
        "true"
      );

      /* =======================================================
         USER ID

         Keep backend ID separately if available.
      ======================================================= */

      if (data.user?.id) {
        localStorage.setItem(
          "pulseiq_user_id",
          String(data.user.id)
        );
      }

      /* =======================================================
         TELL TOPBAR THAT USER DATA CHANGED
      ======================================================= */

      window.dispatchEvent(
        new Event("pulseiq-user-updated")
      );

      /* =======================================================
         GO TO DASHBOARD
      ======================================================= */

      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    }
  };

  return (
    <div className="auth-page">

      {/* =====================================================
          LEFT BRAND SIDE
      ===================================================== */}

      <div className="auth-brand-side">

        <Link
          to="/"
          className="auth-brand"
        >
          Pulse<span>IQ</span>
        </Link>

        <div className="auth-brand-content">

          <span className="auth-eyebrow">
            YOUR DATA. YOUR SIGNAL.
          </span>

          <h1>
            Turn your
            <br />
            numbers into momentum.
          </h1>

          <p>
            Start with your business data and discover the
            signals that deserve your attention.
          </p>

          <div className="auth-benefits">

            <div className="auth-benefit">
              <span className="auth-check">
                ✓
              </span>

              <span>
                Start instantly with sample data
              </span>
            </div>

            <div className="auth-benefit">
              <span className="auth-check">
                ✓
              </span>

              <span>
                Bring your own business data
              </span>
            </div>

            <div className="auth-benefit">
              <span className="auth-check">
                ✓
              </span>

              <span>
                Turn numbers into decisions
              </span>
            </div>

          </div>
        </div>

        <div className="auth-side-footer">
          PulseIQ · Business intelligence for smarter decisions.
        </div>
      </div>

      {/* =====================================================
          RIGHT FORM SIDE
      ===================================================== */}

      <div className="auth-form-side">

        <div className="auth-card">

          <Link
            to="/"
            className="auth-mobile-brand"
          >
            Pulse<span>IQ</span>
          </Link>

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="auth-card-header">

            <span className="auth-card-label">
              GET STARTED
            </span>

            <h2>
              Create your PulseIQ account
            </h2>

            <p>
              Your business dashboard starts here.
            </p>

          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* =================================================
                NAME
            ================================================= */}

            <div className="auth-field">

              <label>
                Full name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your name"
                required
              />

            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="auth-field">

              <label>
                Work email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@company.com"
                required
              />

            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="auth-field">

              <label>
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Create a password"
                minLength={8}
                required
              />

              <small className="password-hint">
                8+ characters · uppercase · lowercase · number
              </small>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              className="auth-submit"
            >
              <span>
                Create account
              </span>

              <span>
                →
              </span>
            </button>

          </form>

          {/* =================================================
              LOGIN DIVIDER
          ================================================= */}

          <div className="auth-divider">
            <span>
              ALREADY HAVE AN ACCOUNT?
            </span>
          </div>

          <div className="auth-switch">

            <Link to="/login">
              Sign in to PulseIQ
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Signup;