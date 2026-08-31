import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = (event) => {

    event.preventDefault();
    setError("");

    const savedUser =
      JSON.parse(
        localStorage.getItem("pulseiq_user")
      );

    if (!savedUser) {
      setError(
        "No account found. Please create an account first."
      );
      return;
    }

    const cleanEmail =
      email.trim().toLowerCase();

    if (
      cleanEmail !== savedUser.email
    ) {
      setError("Incorrect email address.");
      return;
    }

    if (
      password !== savedUser.password
    ) {
      setError("Incorrect password.");
      return;
    }

    localStorage.setItem(
      "pulseiq_logged_in",
      "true"
    );

    navigate("/dashboard");

  };

  return (
    <div className="auth-page">

      <div className="auth-brand-side">

        <Link to="/" className="auth-brand">
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
                onChange={(e) =>
                  setEmail(e.target.value)
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
                onChange={(e) =>
                  setPassword(e.target.value)
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
            Don't have an account?
            {" "}

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