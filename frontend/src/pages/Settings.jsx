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
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
} from "lucide-react";

import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";

import "./settings.css";


function Settings() {

  /* =========================================================
     LOAD SAVED USER
  ========================================================= */

  const getSavedUser = () => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("pulseiq_user") || "{}"
        ) || {}
      );
    } catch {
      return {};
    }
  };

  const savedUser = getSavedUser();


  /* =========================================================
     PROFILE
  ========================================================= */

  const [name, setName] = useState(
    savedUser.name ||
      savedUser.fullName ||
      savedUser.username ||
      ""
  );

  const [email, setEmail] = useState(
    savedUser.email || ""
  );


  /* =========================================================
     BUSINESS DETAILS
  ========================================================= */

  const [companyName, setCompanyName] = useState(
    savedUser.companyName || ""
  );

  const [businessPhone, setBusinessPhone] = useState(
    savedUser.businessPhone || ""
  );

  const [businessEmail, setBusinessEmail] = useState(
    savedUser.businessEmail || ""
  );

  const [businessAddress, setBusinessAddress] = useState(
    savedUser.businessAddress || ""
  );

  const [website, setWebsite] = useState(
    savedUser.website || ""
  );


  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const [businessAlerts, setBusinessAlerts] =
    useState(
      savedUser.businessAlerts ?? true
    );

  const [aiInsights, setAiInsights] =
    useState(
      savedUser.aiInsights ?? true
    );


  /* =========================================================
     SAVE STATES
  ========================================================= */

  const [saved, setSaved] = useState(false);

  const [profileSaved, setProfileSaved] =
    useState(false);


  /* =========================================================
     PASSWORD
  ========================================================= */

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const saveProfile = (event) => {

    event.preventDefault();

    const latestUser = getSavedUser();

    const updatedUser = {
      ...latestUser,

      name: name.trim(),
      email: email.trim(),
    };


    localStorage.setItem(
      "pulseiq_user",
      JSON.stringify(updatedUser)
    );


    /* Tell Topbar that profile changed */

    window.dispatchEvent(
      new Event("pulseiq-user-updated")
    );


    /* Also notify other PulseIQ components */

    window.dispatchEvent(
      new Event("pulseiq-data-updated")
    );


    setProfileSaved(true);

    setTimeout(() => {
      setProfileSaved(false);
    }, 2500);
  };


  /* =========================================================
     SAVE BUSINESS DETAILS + NOTIFICATIONS
  ========================================================= */

  const saveChanges = (event) => {

    event.preventDefault();

    const latestUser = getSavedUser();

    const updatedUser = {
      ...latestUser,

      /* Personal profile */

      name,
      email,

      /* Business profile */

      companyName,
      businessPhone,
      businessEmail,
      businessAddress,
      website,

      /* Notifications */

      businessAlerts,
      aiInsights,
    };


    localStorage.setItem(
      "pulseiq_user",
      JSON.stringify(updatedUser)
    );


    /* Tell Topbar that user/business data changed */

    window.dispatchEvent(
      new Event("pulseiq-user-updated")
    );

    window.dispatchEvent(
      new Event("pulseiq-data-updated")
    );


    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };


  /* =========================================================
     CHANGE PASSWORD
  ========================================================= */

  const changePassword = (event) => {

    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess(false);

    const latestUser = getSavedUser();


    /* Current password check */

    if (
      currentPassword !==
      latestUser.password
    ) {

      setPasswordError(
        "Current password is incorrect."
      );

      return;
    }


    /* New password length */

    if (
      newPassword.length < 6
    ) {

      setPasswordError(
        "New password must be at least 6 characters."
      );

      return;
    }


    /* Confirm password */

    if (
      newPassword !==
      confirmPassword
    ) {

      setPasswordError(
        "New password and confirm password do not match."
      );

      return;
    }


    /* Save new password */

    const updatedUser = {
      ...latestUser,
      password: newPassword,
    };


    localStorage.setItem(
      "pulseiq_user",
      JSON.stringify(updatedUser)
    );


    /* Clear fields */

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


          {/* =================================================
              PAGE HEADING
          ================================================= */}

          <div className="page-heading">

            <div>

              <span className="eyebrow">
                ACCOUNT
              </span>

              <h1>
                Settings
              </h1>

              <p>
                Manage your PulseIQ account,
                business information and preferences.
              </p>

            </div>

          </div>


          {/* =================================================
              PROFILE
          ================================================= */}

          <section className="settings-card">

            <div className="settings-card-top">

              <div className="settings-icon blue">
                <User size={19} />
              </div>

              <div className="settings-header">

                <h2>
                  Profile
                </h2>

                <p>
                  Update your personal account information.
                </p>

              </div>

            </div>


            {/* PROFILE FORM */}

            <form
              className="settings-form"
              onSubmit={saveProfile}
            >

              <div className="settings-fields-row">


                {/* FULL NAME */}

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
                      setName(
                        e.target.value
                      )
                    }
                    placeholder="Your name"
                    required
                  />

                </div>


                {/* EMAIL */}

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
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="you@example.com"
                    required
                  />

                </div>

              </div>


              {/* ⭐ PROFILE SAVE BUTTON */}

              <div className="settings-save-row">

                <button
                  type="submit"
                  className="settings-save"
                >

                  <Save size={16} />

                  Save profile

                </button>


                {profileSaved && (

                  <span className="settings-saved">

                    <CheckCircle2 size={16} />

                    Profile updated successfully

                  </span>

                )}

              </div>

            </form>

          </section>


          {/* =================================================
              BUSINESS INFORMATION
          ================================================= */}

          <section className="settings-card">

            <div className="settings-card-top">

              <div className="settings-icon blue">

                <Building2 size={19} />

              </div>

              <div className="settings-header">

                <h2>
                  Business Information
                </h2>

                <p>
                  These details will automatically
                  appear on your PulseIQ invoices.
                </p>

              </div>

            </div>


            <form
              className="settings-form"
              onSubmit={saveChanges}
            >


              {/* COMPANY NAME */}

              <div className="settings-field">

                <label htmlFor="company-name">
                  Company Name
                </label>

                <div className="settings-input-with-icon">

                  <Building2 size={16} />

                  <input
                    id="company-name"
                    type="text"
                    value={companyName}
                    onChange={(e) =>
                      setCompanyName(
                        e.target.value
                      )
                    }
                    placeholder="Enter your company name"
                  />

                </div>

              </div>


              {/* PHONE + BUSINESS EMAIL */}

              <div className="settings-fields-row">

                <div className="settings-field">

                  <label htmlFor="business-phone">
                    Business Phone
                  </label>

                  <div className="settings-input-with-icon">

                    <Phone size={16} />

                    <input
                      id="business-phone"
                      type="tel"
                      value={businessPhone}
                      onChange={(e) =>
                        setBusinessPhone(
                          e.target.value
                        )
                      }
                      placeholder="+91 XXXXX XXXXX"
                    />

                  </div>

                </div>


                <div className="settings-field">

                  <label htmlFor="business-email">
                    Business Email
                  </label>

                  <div className="settings-input-with-icon">

                    <Mail size={16} />

                    <input
                      id="business-email"
                      type="email"
                      value={businessEmail}
                      onChange={(e) =>
                        setBusinessEmail(
                          e.target.value
                        )
                      }
                      placeholder="business@example.com"
                    />

                  </div>

                </div>

              </div>


              {/* ADDRESS + WEBSITE */}

              <div className="settings-fields-row">

                <div className="settings-field">

                  <label htmlFor="business-address">
                    Business Address
                  </label>

                  <div className="settings-input-with-icon">

                    <MapPin size={16} />

                    <input
                      id="business-address"
                      type="text"
                      value={businessAddress}
                      onChange={(e) =>
                        setBusinessAddress(
                          e.target.value
                        )
                      }
                      placeholder="Enter business address"
                    />

                  </div>

                </div>


                <div className="settings-field">

                  <label htmlFor="business-website">
                    Website
                  </label>

                  <div className="settings-input-with-icon">

                    <Globe size={16} />

                    <input
                      id="business-website"
                      type="text"
                      value={website}
                      onChange={(e) =>
                        setWebsite(
                          e.target.value
                        )
                      }
                      placeholder="www.yourcompany.com"
                    />

                  </div>

                </div>

              </div>


              {/* SAVE BUSINESS */}

              <div className="settings-save-row">

                <button
                  type="submit"
                  className="settings-save"
                >

                  <Save size={16} />

                  Save business details

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


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <section className="settings-card">

            <div className="settings-card-top">

              <div className="settings-icon orange">

                <Bell size={19} />

              </div>

              <div className="settings-header">

                <h2>
                  Notifications
                </h2>

                <p>
                  Choose what updates you want to receive.
                </p>

              </div>

            </div>


            <div className="settings-options">


              {/* BUSINESS ALERTS */}

              <label className="notification-option">

                <div className="notification-option-info">

                  <strong>
                    Business alerts
                  </strong>

                  <span>
                    Get notified about important
                    business activity.
                  </span>

                </div>


                <input
                  type="checkbox"
                  checked={businessAlerts}
                  onChange={(e) =>
                    setBusinessAlerts(
                      e.target.checked
                    )
                  }
                />

                <span className="custom-toggle"></span>

              </label>


              {/* PRISM AI */}

              <label className="notification-option">

                <div className="notification-option-info">

                  <strong>
                    Prism AI insights
                  </strong>

                  <span>
                    Receive useful AI-powered
                    business insights.
                  </span>

                </div>


                <input
                  type="checkbox"
                  checked={aiInsights}
                  onChange={(e) =>
                    setAiInsights(
                      e.target.checked
                    )
                  }
                />

                <span className="custom-toggle"></span>

              </label>

            </div>

          </section>


          {/* =================================================
              SECURITY
          ================================================= */}

          <section className="settings-card">

            <div className="settings-card-top">

              <div className="settings-icon green">

                <Shield size={19} />

              </div>

              <div className="settings-header">

                <h2>
                  Security
                </h2>

                <p>
                  Manage your password and keep
                  your account secure.
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
                  Your password is active and
                  protecting your account.
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
                      setCurrentPassword(
                        e.target.value
                      )
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


              {/* NEW + CONFIRM PASSWORD */}

              <div className="settings-fields-row">


                {/* NEW PASSWORD */}

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
                        setNewPassword(
                          e.target.value
                        )
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
                        setConfirmPassword(
                          e.target.value
                        )
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


              {/* PASSWORD ERROR */}

              {passwordError && (

                <div className="password-message error">

                  {passwordError}

                </div>

              )}


              {/* PASSWORD SUCCESS */}

              {passwordSuccess && (

                <div className="password-message success">

                  <CheckCircle2 size={16} />

                  Password changed successfully.

                </div>

              )}


              {/* CHANGE PASSWORD BUTTON */}

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