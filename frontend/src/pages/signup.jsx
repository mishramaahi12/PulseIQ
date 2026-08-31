import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Signup() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = (event) => {

    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const passwordValid =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password);

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

    const existingUser =
      JSON.parse(
        localStorage.getItem("pulseiq_user")
      );

    if (
      existingUser &&
      existingUser.email === cleanEmail
    ) {
      setError(
        "An account with this email already exists."
      );
      return;
    }

    const user = {
      name: cleanName,
      email: cleanEmail,
      password,
    };

    localStorage.setItem(
      "pulseiq_user",
      JSON.stringify(user)
    );

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
              GET STARTED
            </span>

            <h2>
              Create your PulseIQ account
            </h2>

            <p>
              Your business dashboard starts here.
            </p>

          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            <div className="auth-field">

              <label>
                Full name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Your name"
                required
              />

            </div>

            <div className="auth-field">

              <label>
                Work email
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
                placeholder="Create a password"
                minLength={8}
                required
              />

              <small className="password-hint">
                8+ characters · uppercase · lowercase · number
              </small>

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
                Create account
              </span>

              <span>
                →
              </span>
            </button>

          </form>

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