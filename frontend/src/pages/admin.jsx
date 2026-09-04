import { useEffect, useState } from "react";

import {
  ShieldCheck,
  Users,
  Activity,
  RefreshCw,
  Search,
  Clock3,
} from "lucide-react";

import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";

import "./admin.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

function Admin() {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // CURRENT USER
  // =====================================================

  let userData = {};

  try {
    userData = JSON.parse(
      localStorage.getItem("pulseiq_user") || "{}"
    );
  } catch {
    userData = {};
  }

  const userId = userData?.id;

  // =====================================================
  // ADMIN CHECK
  // =====================================================

  const adminEmail = (
    import.meta.env.VITE_ADMIN_EMAIL || ""
  )
    .trim()
    .toLowerCase();

  const currentUserEmail = (
    userData?.email || ""
  )
    .trim()
    .toLowerCase();

  const isAdmin =
    adminEmail !== "" &&
    currentUserEmail !== "" &&
    currentUserEmail === adminEmail;

  // =====================================================
  // LOAD ADMIN DATA
  // =====================================================

  const loadAdminData = async () => {
    if (!userId) {
      setError(
        "Admin session not found. Please login again."
      );
      setLoading(false);
      return;
    }

    if (!isAdmin) {
      setError(
        "You do not have permission to access the Admin Dashboard."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = {
        "x-user-id": String(userId),
      };

      const [
        usersResponse,
        activityResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/admin/users`, {
          headers,
        }),

        fetch(`${API_URL}/admin/activity`, {
          headers,
        }),
      ]);

      const usersData =
        await usersResponse.json();

      const activityData =
        await activityResponse.json();

      if (!usersResponse.ok) {
        throw new Error(
          usersData.detail ||
            "Unable to load users."
        );
      }

      if (!activityResponse.ok) {
        throw new Error(
          activityData.detail ||
            "Unable to load activity."
        );
      }

      setUsers(usersData.users || []);
      setActivities(
        activityData.activities || []
      );

    } catch (err) {
      setError(
        err.message ||
          "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadAdminData();
  }, []);

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return "Never";
    }

    return new Date(value).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =====================================================
  // USER SEARCH
  // =====================================================

  const filteredUsers = users.filter(
    (user) => {
      const query =
        search.toLowerCase();

      return (
        user.name
          ?.toLowerCase()
          .includes(query) ||
        user.email
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  // =====================================================
  // ACTIVITY SEARCH
  // =====================================================

  const filteredActivities =
    activities.filter((item) => {
      const query =
        search.toLowerCase();

      return (
        item.user_name
          ?.toLowerCase()
          .includes(query) ||
        item.user_email
          ?.toLowerCase()
          .includes(query) ||
        item.action
          ?.toLowerCase()
          .includes(query) ||
        item.description
          ?.toLowerCase()
          .includes(query)
      );
    });

  // =====================================================
  // ACCESS DENIED
  // =====================================================

  if (!isAdmin) {
    return (
      <div className="dashboard-layout">

        <Sidebar />

        <div className="dashboard-main">

          <Topbar />

          <main className="admin-page">

            <div className="admin-error">
              <strong>
                Access Denied
              </strong>

              <span>
                You do not have permission
                to access the Admin Dashboard.
              </span>
            </div>

          </main>

        </div>

      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Topbar />

        <main className="admin-page">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="admin-header">

            <div>

              <div className="admin-title">

                <div className="admin-title-icon">
                  <ShieldCheck size={23} />
                </div>

                <div>
                  <h1>
                    Admin Dashboard
                  </h1>

                  <p>
                    Monitor users and activity
                    across PulseIQ.
                  </p>
                </div>

              </div>

            </div>

            <button
              className="admin-refresh"
              onClick={loadAdminData}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "spin"
                    : ""
                }
              />

              Refresh
            </button>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="admin-error">

              <strong>
                Unable to load admin data
              </strong>

              <span>
                {error}
              </span>

            </div>
          )}

          {/* =================================================
              STATS
          ================================================= */}

          <div className="admin-stats">

            <div className="admin-stat-card">

              <div className="admin-stat-icon users">
                <Users size={21} />
              </div>

              <div>
                <span>
                  Total Users
                </span>

                <strong>
                  {users.length}
                </strong>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon activity">
                <Activity size={21} />
              </div>

              <div>
                <span>
                  Total Activities
                </span>

                <strong>
                  {activities.length}
                </strong>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon active">
                <Clock3 size={21} />
              </div>

              <div>
                <span>
                  Active Users
                </span>

                <strong>
                  {
                    users.filter(
                      (user) =>
                        user.last_login
                    ).length
                  }
                </strong>
              </div>

            </div>

          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="admin-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search users or activities..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          {/* =================================================
              USERS
          ================================================= */}

          <section className="admin-section">

            <div className="admin-section-header">

              <div>

                <h2>
                  Registered Users
                </h2>

                <p>
                  All accounts created
                  on PulseIQ
                </p>

              </div>

              <span className="admin-count">
                {filteredUsers.length} users
              </span>

            </div>

            <div className="admin-table-container">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Last Login</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (

                    <tr>
                      <td
                        colSpan="4"
                        className="admin-empty"
                      >
                        Loading users...
                      </td>
                    </tr>

                  ) : filteredUsers.length === 0 ? (

                    <tr>
                      <td
                        colSpan="4"
                        className="admin-empty"
                      >
                        No users found.
                      </td>
                    </tr>

                  ) : (

                    filteredUsers.map(
                      (user) => (
                        <tr key={user.id}>

                          <td>

                            <div className="admin-user">

                              <div className="admin-avatar">
                                {user.name
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </div>

                              <strong>
                                {user.name}
                              </strong>

                            </div>

                          </td>

                          <td className="admin-email">
                            {user.email}
                          </td>

                          <td>
                            {formatDate(
                              user.created_at
                            )}
                          </td>

                          <td>

                            <span
                              className={
                                user.last_login
                                  ? "login-status logged"
                                  : "login-status never"
                              }
                            >
                              {user.last_login
                                ? formatDate(
                                    user.last_login
                                  )
                                : "Never"}
                            </span>

                          </td>

                        </tr>
                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </section>

          {/* =================================================
              ACTIVITY
          ================================================= */}

          <section className="admin-section">

            <div className="admin-section-header">

              <div>

                <h2>
                  Activity Log
                </h2>

                <p>
                  Track what users are doing
                  on PulseIQ
                </p>

              </div>

              <span className="admin-count">
                {filteredActivities.length} activities
              </span>

            </div>

            <div className="admin-table-container">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>Time</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (

                    <tr>
                      <td
                        colSpan="4"
                        className="admin-empty"
                      >
                        Loading activities...
                      </td>
                    </tr>

                  ) : filteredActivities.length === 0 ? (

                    <tr>
                      <td
                        colSpan="4"
                        className="admin-empty"
                      >
                        No activity found.
                      </td>
                    </tr>

                  ) : (

                    filteredActivities.map(
                      (item) => (
                        <tr key={item.id}>

                          <td>

                            <div className="activity-user">

                              <strong>
                                {item.user_name}
                              </strong>

                              <small>
                                {item.user_email}
                              </small>

                            </div>

                          </td>

                          <td>

                            <span className="activity-badge">
                              {item.action}
                            </span>

                          </td>

                          <td className="activity-description">
                            {item.description ||
                              "—"}
                          </td>

                          <td className="activity-time">
                            {formatDate(
                              item.created_at
                            )}
                          </td>

                        </tr>
                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Admin;