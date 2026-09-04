import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      const response = await fetch(
        "http://10.45.196.65:8000/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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

      /* =====================================================
         BACKEND ERROR
      ===================================================== */

      if (!response.ok) {
        setError(
          data.detail ||
            data.message ||
            "Incorrect email or password."
        );

        return;
      }

      /* =====================================================
         VALIDATE USER
      ===================================================== */

      if (!data.user || !data.user.id) {
        setError(
          "Login succeeded, but the server did not return a valid user ID."
        );

        return;
      }

      /* =====================================================
         GET PREVIOUSLY SAVED USER
         
         This is important because backend may return:
         id + email
         
         but may not return name.
      ===================================================== */

      let previousUser = {};

      try {
        previousUser = JSON.parse(
          localStorage.getItem("pulseiq_user") || "{}"
        );
      } catch {
        previousUser = {};
      }

      /* =====================================================
         BUILD FINAL USER
      ===================================================== */

      const finalUser = {
        ...previousUser,
        ...data.user,

        name:
          data.user?.name ||
          previousUser?.name ||
          data.user?.fullName ||
          previousUser?.fullName ||
          data.user?.username ||
          previousUser?.username ||
          cleanEmail.split("@")[0],

        email:
          data.user?.email ||
          previousUser?.email ||
          cleanEmail,
      };

      /* =====================================================
         SAVE COMPLETE USER
      ===================================================== */

      localStorage.setItem(
        "pulseiq_user",
        JSON.stringify(finalUser)
      );

      /* =====================================================
         SAVE USER ID
      ===================================================== */

      localStorage.setItem(
        "pulseiq_user_id",
        String(data.user.id)
      );

      /* =====================================================
         LOGIN STATUS
      ===================================================== */

      localStorage.setItem(
        "pulseiq_logged_in",
        "true"
      );

      /* =====================================================
         UPDATE TOPBAR IMMEDIATELY
      ===================================================== */

      window.dispatchEvent(
        new Event("pulseiq-user-updated")
      );

      /* =====================================================
         GO TO DASHBOARD
      ===================================================== */

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

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
            BUSINESS INTELLIGENCE, REFINED
          </span>

          <h1>
            Your business
            <br />
            has more to say.
          </h1>

          <p>
            PulseIQ turns scattered numbers into clear signals,
            useful insights and better decisions.
          </p>

          <div className="auth-benefits">

            <div className="auth-benefit">
              <span className="auth-check">
                ✓
              </span>

              <span>
                See performance without spreadsheet chaos
              </span>
            </div>

            <div className="auth-benefit">
              <span className="auth-check">
                ✓
              </span>

              <span>
                Turn patterns into actionable insights
              </span>
            </div>

            <div className="auth-benefit">
              <span className="auth-check">
                ✓
              </span>

              <span>
                Keep every important number in one place
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

          <div className="auth-card-header">

            <span className="auth-card-label">
              WELCOME BACK
            </span>

            <h2>
              Sign in to PulseIQ
            </h2>

            <p>
              Pick up where your business left off.
            </p>

          </div>

          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            <div className="auth-field">

              <label>
                Email address
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
                placeholder="Enter your password"
                required
              />

            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
            >
              <span>
                Sign in
              </span>

              <span>
                →
              </span>
            </button>

          </form>

          <div className="auth-divider">
            <span>
              OR
            </span>
          </div>

          <div className="auth-switch">
            Don't have an account?{" "}

            <Link to="/signup">
              Create one
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;