import {
  Bell,
  Search,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useState } from "react";
import "./topbar.css";

function Topbar() {

  const navigate = useNavigate();
  const location = useLocation();

  const user =
    JSON.parse(
      localStorage.getItem("pulseiq_user")
    ) || {};

  const userName =
    user.name || "Administrator";

  const userInitial =
    userName.charAt(0).toUpperCase();

  const [search, setSearch] = useState("");
  const [showNotification, setShowNotification] =
    useState(false);
  const [showProfile, setShowProfile] =
    useState(false);

  const handleLogout = () => {

    localStorage.removeItem(
      "pulseiq_logged_in"
    );

    navigate("/login");

  };

  const handleSearch = (event) => {

    if (
      event.key === "Enter" &&
      search.trim()
    ) {

      const value =
        search.trim().toLowerCase();

      if (value.includes("analytics")) {
        navigate("/analytics");
      }
      else if (
        value.includes("customer")
      ) {
        navigate("/customers");
      }
      else if (
        value.includes("upload") ||
        value.includes("data")
      ) {
        navigate("/upload");
      }
      else if (
        value.includes("prism") ||
        value.includes("ai")
      ) {
        navigate("/prismai");
      }
      else if (
        value.includes("setting")
      ) {
        navigate("/settings");
      }
      else {
        navigate(
          `/analytics?search=${encodeURIComponent(
            search.trim()
          )}`
        );
      }

      setSearch("");
    }

  };

  return (
    <header className="dashboard-topbar">

      <div className="topbar-search">

        <Search size={17} />

        <input
          type="text"
          placeholder="Search anything..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          onKeyDown={handleSearch}
        />

      </div>

      <div className="topbar-actions">

        {/* NOTIFICATIONS */}

        <div className="topbar-notification">

          <button
            type="button"
            className="topbar-icon"
            onClick={() => {
              setShowNotification(
                !showNotification
              );
              setShowProfile(false);
            }}
          >

            <Bell size={18} />

            <span className="notification-dot" />

          </button>

          {showNotification && (

            <div className="topbar-dropdown notification-dropdown">

              <div className="dropdown-title">
                Notifications
              </div>

              <p>
                📈 Revenue increased by 18%
              </p>

              <p>
                🛒 12 new orders today
              </p>

              <p>
                🤖 New Prism AI insight available
              </p>

            </div>

          )}

        </div>

        {/* PROFILE */}

        <div className="administrator-wrapper">

          <button
            type="button"
            className="administrator"
            onClick={() => {
              setShowProfile(
                !showProfile
              );

              setShowNotification(false);
            }}
          >

            <div className="administrator-avatar">
              {userInitial}
            </div>

            <div className="administrator-info">

              <strong>
                {userName}
              </strong>

              <span>
                Administrator
              </span>

            </div>

            <ChevronDown
              size={16}
              className={
                showProfile
                  ? "rotate-arrow"
                  : ""
              }
            />

          </button>

          {showProfile && (

            <div className="administrator-menu">

              <div className="admin-menu-header">

                <div className="administrator-avatar large">
                  {userInitial}
                </div>

                <div>
                  <strong>
                    {userName}
                  </strong>

                  <span>
                    Administrator
                  </span>
                </div>

              </div>

              <div className="admin-menu-divider" />

              <button
                type="button"
                onClick={() => {
                  setShowProfile(false);
                  navigate("/settings");
                }}
              >
                <Settings size={16} />
                Settings
              </button>

              <button
                type="button"
                className="dropdown-logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default Topbar;