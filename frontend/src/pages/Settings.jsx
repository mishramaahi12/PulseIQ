import { useState } from "react";

import {
  User,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  LockKeyhole,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";
import "./settings.css";

function Settings() {
  const savedUser =
    JSON.parse(localStorage.getItem("pulseiq_user")) || {};

  const [name, setName] = useState(savedUser.name || "");
  const [email, setEmail] = useState(savedUser.email || "");

  const [businessAlerts, setBusinessAlerts] = useState(true);
  const [aiInsights, setAiInsights] = useState(true);

  const [saved, setSaved] = useState(false);

  // PASSWORD
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // SAVE PROFILE
  const saveChanges = (event) => {
    event.preventDefault();

    const latestUser =
      JSON.parse(localStorage.getItem("pulseiq_user")) || {};

    const updatedUser = {
      ...latestUser,
      name,
      email,
    };

    localStorage.setItem(
      "pulseiq_user",
      JSON.stringify(updatedUser)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  // CHANGE PASSWORD
  const changePassword = (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess(false);

    const latestUser =
      JSON.parse(localStorage.getItem("pulseiq_user")) || {};

    // Current password check
    if (currentPassword !== latestUser.password) {
      setPasswordError("Current password is incorrect.");
      return;
    }

    // New password length
    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    // Confirm password
    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    // Save NEW password
    const updatedUser = {
      ...latestUser,
      password: newPassword,
    };

    localStorage.setItem(
      "pulseiq_user",
      JSON.stringify(updatedUser)
    );

    // Clear fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordSuccess(true);

    setTimeout(() => {
      setPasswordSuccess(false);
    }, 3000);
  };

  return (
    <div className="dashboard-shell">

      <Sidebar />

      <div className="dashboard-main">

        <Topbar />

        <main className="dashboard-content">

          {/* PAGE HEADING */}

          <div className="page-heading">
            <div>
              <span className="eyebrow">
                ACCOUNT
              </span>

              <h1>Settings</h1>

              <p>
                Manage your PulseIQ account and preferences.
              </p>
            </div>
          </div>


          {/* PROFILE */}

          <section className="settings-card">

            <div className="settings-card-top">

              <div className="settings-icon blue">
                <User size={19} />
              </div>

              <div className="settings-header">

                <h2>Profile</h2>

                <p>
                  Update your personal account information.
                </p>

              </div>

            </div>


            <form
              className="settings-form"
              onSubmit={saveChanges}
            >

              <div className="settings-fields-row">

                <div className="settings-field">

                  <label htmlFor="settings-name">
                    Full name
                  </label>

                  <input
                    id="settings-name"
                    name="name"
                    type="text"
                    value={name}
                    autoComplete="name"
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Your name"
                    required
                  />

                </div>


                <div className="settings-field">

                  <label htmlFor="settings-email">
                    Email address
                  </label>

                  <input
                    id="settings-email"
                    name="email"
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    required
                  />

                </div>

              </div>


              <div className="settings-save-row">

                <button
                  type="submit"
                  className="settings-save"
                >
                  <Save size={16} />

                  Save changes
                </button>

                {saved && (
                  <span className="settings-saved">

                    <CheckCircle2 size={16} />

                    Changes saved successfully

                  </span>
                )}

              </div>

            </form>

          </section>


          {/* NOTIFICATIONS */}

          <section className="settings-card">

            <div className="settings-card-top">

              <div className="settings-icon orange">
                <Bell size={19} />
              </div>

              <div className="settings-header">

                <h2>Notifications</h2>

                <p>
                  Choose what updates you want to receive.
                </p>

              </div>

            </div>


            <div className="settings-options">

              <label className="notification-option">

                <div className="notification-option-info">

                  <strong>
                    Business alerts
                  </strong>

                  <span>
                    Get notified about important business activity.
                  </span>

                </div>

                <input
                  type="checkbox"
                  checked={businessAlerts}
                  onChange={(e) =>
                    setBusinessAlerts(e.target.checked)
                  }
                />

                <span className="custom-toggle"></span>

              </label>


              <label className="notification-option">

                <div className="notification-option-info">

                  <strong>
                    Prism AI insights
                  </strong>

                  <span>
                    Receive useful AI-powered business insights.
                  </span>

                </div>

                <input
                  type="checkbox"
                  checked={aiInsights}
                  onChange={(e) =>
                    setAiInsights(e.target.checked)
                  }
                />

                <span className="custom-toggle"></span>

              </label>

            </div>

          </section>


          {/* SECURITY */}

          <section className="settings-card">

            <div className="settings-card-top">

              <div className="settings-icon green">
                <Shield size={19} />
              </div>

              <div className="settings-header">

                <h2>Security</h2>

                <p>
                  Manage your password and keep your account secure.
                </p>

              </div>

            </div>


            {/* PASSWORD STATUS */}

            <div className="security-status">

              <div className="security-status-icon">
                <LockKeyhole size={17} />
              </div>

              <div>

                <strong>
                  Your account is protected
                </strong>

                <span>
                  Your password is active and protecting your account.
                </span>

              </div>

              <span className="security-active">
                Protected
              </span>

            </div>


            {/* CHANGE PASSWORD */}

            <form
              className="password-change-form"
              onSubmit={changePassword}
            >

              <div className="password-section-title">

                <div className="password-section-icon">
                  <KeyRound size={17} />
                </div>

                <div>

                  <strong>
                    Change password
                  </strong>

                  <span>
                    Update your login password securely.
                  </span>

                </div>

              </div>


              {/* CURRENT PASSWORD */}

              <div className="settings-field">

                <label htmlFor="current-password">
                  Current password
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="current-password"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(e.target.value)
                    }
                    placeholder="Enter current password"
                    required
                  />

                  <button
                    type="button"
                    className="password-eye"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                </div>

              </div>


              {/* NEW PASSWORD */}

              <div className="settings-fields-row">

                <div className="settings-field">

                  <label htmlFor="new-password">
                    New password
                  </label>

                  <div className="password-input-wrapper">

                    <input
                      id="new-password"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      required
                    />

                    <button
                      type="button"
                      className="password-eye"
                      onClick={() =>
                        setShowNewPassword(
                          !showNewPassword
                        )
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>

                  </div>

                </div>


                {/* CONFIRM PASSWORD */}

                <div className="settings-field">

                  <label htmlFor="confirm-password">
                    Confirm new password
                  </label>

                  <div className="password-input-wrapper">

                    <input
                      id="confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Re-enter new password"
                      minLength={6}
                      required
                    />

                    <button
                      type="button"
                      className="password-eye"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>

                  </div>

                </div>

              </div>


              {/* ERROR */}

              {passwordError && (
                <div className="password-message error">
                  {passwordError}
                </div>
              )}


              {/* SUCCESS */}

              {passwordSuccess && (
                <div className="password-message success">

                  <CheckCircle2 size={16} />

                  Password changed successfully.

                </div>
              )}


              {/* CHANGE BUTTON */}

              <div className="password-save-row">

                <button
                  type="submit"
                  className="password-change-button"
                >

                  <KeyRound size={16} />

                  Change password

                </button>

              </div>

            </form>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Settings;