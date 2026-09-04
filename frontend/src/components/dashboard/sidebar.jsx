import {
  LayoutDashboard,
  Upload,
  FileText,
  Users,
  Receipt,
  WalletCards,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import "./sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },

    {
      label: "Upload Data",
      icon: Upload,
      path: "/upload",
    },

    {
      label: "Reports",
      icon: FileText,
      path: "/reports",
    },

    {
      label: "Customers",
      icon: Users,
      path: "/customers",
    },

    {
      label: "Invoices",
      icon: Receipt,
      path: "/invoice",
    },

    // =====================================================
    // EXPENSES
    // =====================================================

    {
      label: "Expenses",
      icon: WalletCards,
      path: "/expenses",
    },

    {
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },

    {
      label: "PRISM AI",
      icon: Sparkles,
      path: "/prismai",
      special: true,
    },
  ];

  // =======================================================
  // LOGOUT
  // =======================================================

  const handleLogout = () => {
    localStorage.removeItem("pulseiq_logged_in");
    localStorage.removeItem("pulseiq_user");

    navigate("/login");
  };

  // =======================================================
  // ACTIVE LINK
  // =======================================================

  const isActive = (path) => {
    if (path === "/upload") {
      return (
        location.pathname === "/upload" ||
        location.pathname === "/uploaddata"
      );
    }

    return location.pathname === path;
  };

  // =======================================================
  // UI
  // =======================================================

  return (
    <aside className="dashboard-sidebar">

      {/* =================================================
          BRAND
      ================================================= */}

      <div className="sidebar-brand">
        <button
          type="button"
          className="sidebar-brand-button"
          onClick={() => navigate("/dashboard")}
        >
          <span>Pulse</span>
          <strong>IQ</strong>
        </button>

        <span className="sidebar-brand-tagline">
          Business Intelligence
        </span>
      </div>

      {/* =================================================
          WORKSPACE
      ================================================= */}

      <div className="sidebar-label">
        WORKSPACE
      </div>

      <nav className="sidebar-nav">

        {links.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              type="button"
              className={`sidebar-link ${
                active ? "active" : ""
              } ${
                item.special
                  ? "sidebar-ai-link"
                  : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-link-icon">
                <Icon
                  size={18}
                  strokeWidth={1.9}
                />
              </span>

              <span className="sidebar-link-text">
                {item.label}
              </span>

              {item.special && (
                <span className="sidebar-ai-dot" />
              )}
            </button>
          );
        })}

      </nav>

      {/* =================================================
          BOTTOM
      ================================================= */}

      <div className="sidebar-bottom">

        {/* SETTINGS */}

        <button
          type="button"
          className={`sidebar-link ${
            location.pathname === "/settings"
              ? "active"
              : ""
          }`}
          onClick={() => navigate("/settings")}
        >
          <span className="sidebar-link-icon">
            <Settings
              size={18}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-link-text">
            Settings
          </span>
        </button>

        {/* LOGOUT */}

        <button
          type="button"
          className="sidebar-link sidebar-logout"
          onClick={handleLogout}
        >
          <span className="sidebar-link-icon">
            <LogOut
              size={18}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-link-text">
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;