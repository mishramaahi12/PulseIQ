import {
  LayoutDashboard,
  BarChart3,
  Users,
  Upload,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

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
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
    {
      label: "Customers",
      icon: Users,
      path: "/customers",
    },
    {
      label: "Upload Data",
      icon: Upload,
      path: "/upload",
    },
    {
      label: "PRISM AI",
      icon: Sparkles,
      path: "/prismai",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("pulseiq_user");
    navigate("/login");
  };

  return (
    <aside className="dashboard-sidebar">

      <div className="sidebar-brand">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="sidebar-brand-button"
        >
          Pulse<span>IQ</span>
        </button>
      </div>

      <div className="sidebar-label">
        WORKSPACE
      </div>

      <nav className="sidebar-nav">

        {links.map((item) => {
          const Icon = item.icon;

          const active =
            item.path === "/upload"
              ? location.pathname === "/upload" ||
                location.pathname === "/uploaddata"
              : location.pathname === item.path;

          return (
            <button
              key={item.path}
              type="button"
              className={`sidebar-link ${active ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}

      </nav>

      <div className="sidebar-bottom">

        <button
          type="button"
          className={`sidebar-link ${
            location.pathname === "/settings" ? "active" : ""
          }`}
          onClick={() => navigate("/settings")}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        <button
          type="button"
          className="sidebar-link sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;