import { useEffect, useMemo, useState } from "react";

import {
  Search,
  X,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  LayoutDashboard,
  Upload,
  FileText,
  Users,
  Receipt,
  BarChart3,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  UserRound,
  CircleDollarSign,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import "./topbar.css";


function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  /* =========================================================
     USER
  ========================================================= */

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("pulseiq_user") || "{}"
      );
    } catch {
      return {};
    }
  });

  const loadUser = () => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("pulseiq_user") || "{}"
      );

      setUser(savedUser);
    } catch {
      setUser({});
    }
  };

  useEffect(() => {
    loadUser();

    window.addEventListener(
      "pulseiq-user-updated",
      loadUser
    );

    window.addEventListener(
      "storage",
      loadUser
    );

    return () => {
      window.removeEventListener(
        "pulseiq-user-updated",
        loadUser
      );

      window.removeEventListener(
        "storage",
        loadUser
      );
    };
  }, []);

  const userName =
    user?.name ||
    user?.fullName ||
    user?.full_name ||
    user?.username ||
    user?.userName ||
    user?.email?.split("@")[0] ||
    "Administrator";

  const cleanUserName =
    String(userName).trim() || "Administrator";

  const userInitial =
    cleanUserName.charAt(0).toUpperCase() || "A";


  /* =========================================================
     SEARCH PAGES
  ========================================================= */

  const searchPages = [
    {
      id: "dashboard",
      title: "Dashboard",
      description: "Business overview and KPIs",
      path: "/dashboard",
      icon: LayoutDashboard,
      keywords:
        "dashboard home overview business command center",
    },
    {
      id: "upload",
      title: "Upload Data",
      description: "Upload or manage your business data",
      path: "/upload",
      icon: Upload,
      keywords:
        "upload data csv dataset import",
    },
    {
      id: "reports",
      title: "Reports",
      description: "Generate and export business reports",
      path: "/reports",
      icon: FileText,
      keywords:
        "reports report export pdf csv business",
    },
    {
      id: "customers",
      title: "Customers",
      description: "View and manage customers",
      path: "/customers",
      icon: Users,
      keywords:
        "customers clients users buyers",
    },
    {
      id: "invoice",
      title: "Invoices",
      description: "Create and manage invoices",
      path: "/invoice",
      icon: Receipt,
      keywords:
        "invoice billing bill payment",
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Explore detailed business analytics",
      path: "/analytics",
      icon: BarChart3,
      keywords:
        "analytics charts trends analysis insights",
    },
    {
      id: "prismai",
      title: "PRISM AI",
      description: "Ask AI about your business",
      path: "/prismai",
      icon: Sparkles,
      keywords:
        "prism ai artificial intelligence assistant chatbot",
    },
    {
      id: "settings",
      title: "Settings",
      description: "Manage your business profile",
      path: "/settings",
      icon: Settings,
      keywords:
        "settings profile business company preferences",
    },
  ];


  const filteredSearchPages = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return searchPages.filter((page) => {
      const searchableText = `
        ${page.title}
        ${page.description}
        ${page.keywords}
      `.toLowerCase();

      return searchableText.includes(query);
    });
  }, [search]);


  const goToSearchResult = (page) => {
    setSearch("");
    setShowSearchResults(false);
    setShowNotification(false);
    setShowProfile(false);

    navigate(page.path);
  };


  const handleSearch = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const query = search.trim().toLowerCase();

    if (!query) {
      return;
    }

    const exactMatch = searchPages.find((page) => {
      return (
        page.title.toLowerCase() === query ||
        page.id.toLowerCase() === query
      );
    });

    const firstMatch =
      exactMatch || filteredSearchPages[0];

    if (firstMatch) {
      goToSearchResult(firstMatch);
    }
  };


  /* =========================================================
     BUSINESS DATA
  ========================================================= */

  const getBusinessData = () => {
    try {
      const savedData = localStorage.getItem(
        "pulseiq_business_data"
      );

      if (!savedData) {
        return [];
      }

      const parsed = JSON.parse(savedData);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };


  const getAmount = (row) => {
    const value =
      row?.totalAmount ??
      row?.total_amount ??
      row?.amount ??
      row?.total ??
      0;

    const number = Number(
      String(value)
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .trim()
    );

    return Number.isFinite(number) ? number : 0;
  };


  const getCustomer = (row) => {
    return (
      row?.customerName ||
      row?.customer_name ||
      row?.customer ||
      ""
    )
      .toString()
      .trim();
  };


  const getPaymentStatus = (row) => {
    return (
      row?.paymentStatus ||
      row?.payment_status ||
      row?.status ||
      ""
    )
      .toString()
      .trim()
      .toLowerCase();
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };


  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const [notifications, setNotifications] = useState([]);


  const buildNotifications = () => {
    const rows = getBusinessData();

    if (!rows.length) {
      setNotifications([
        {
          id: "demo",
          type: "info",
          icon: Info,
          title: "Demo business data",
          message:
            "You're currently exploring PulseIQ with sample data.",
        },
        {
          id: "upload",
          type: "success",
          icon: Upload,
          title: "Upload your data",
          message:
            "Upload a CSV to unlock live business insights.",
        },
        {
          id: "ai",
          type: "AI",
          icon: Sparkles,
          title: "PRISM AI is ready",
          message:
            "Ask PRISM AI questions about your business.",
        },
      ]);

      return;
    }


    const totalRevenue = rows.reduce(
      (sum, row) => sum + getAmount(row),
      0
    );

    const totalOrders = rows.length;

    const uniqueCustomers = new Set(
      rows
        .map(getCustomer)
        .filter(Boolean)
        .map((name) => name.toLowerCase())
    ).size;


    const pendingRows = rows.filter((row) => {
      const status = getPaymentStatus(row);

      return (
        status === "pending" ||
        status === "unpaid" ||
        status === "due"
      );
    });


    const pendingAmount = pendingRows.reduce(
      (sum, row) => sum + getAmount(row),
      0
    );


    const paidRows = rows.filter((row) => {
      const status = getPaymentStatus(row);

      return (
        status === "paid" ||
        status === "completed" ||
        status === "complete"
      );
    });


    const generatedNotifications = [
      {
        id: "live",
        type: "success",
        icon: CheckCircle2,
        title: "Live business data active",
        message: `${totalOrders} transactions are connected to PulseIQ.`,
      },
      {
        id: "revenue",
        type: "revenue",
        icon: CircleDollarSign,
        title: "Revenue overview",
        message: `Total recorded revenue is ${formatCurrency(
          totalRevenue
        )}.`,
      },
      {
        id: "orders",
        type: "orders",
        icon: ShoppingCart,
        title: "Order activity",
        message: `${totalOrders} business transactions recorded.`,
      },
      {
        id: "customers",
        type: "customers",
        icon: UserRound,
        title: "Customer activity",
        message: `${uniqueCustomers} unique customers found in your data.`,
      },
    ];


    if (pendingRows.length > 0) {
      generatedNotifications.push({
        id: "pending",
        type: "warning",
        icon: AlertCircle,
        title: "Pending payments",
        message: `${pendingRows.length} transactions worth ${formatCurrency(
          pendingAmount
        )} are pending.`,
      });
    } else {
      generatedNotifications.push({
        id: "pending-clear",
        type: "success",
        icon: CheckCircle2,
        title: "Payments are clear",
        message:
          "No pending payment transactions were detected.",
      });
    }


    generatedNotifications.push({
      id: "collection",
      type: "success",
      icon: TrendingUp,
      title: "Payment collection",
      message: `${paidRows.length} transactions are marked as paid.`,
    });


    generatedNotifications.push({
      id: "ai",
      type: "AI",
      icon: Sparkles,
      title: "PRISM AI ready",
      message:
        "Use PRISM AI to understand your business data.",
    });


    setNotifications(generatedNotifications);
  };


  useEffect(() => {
    buildNotifications();

    window.addEventListener(
      "pulseiq-data-updated",
      buildNotifications
    );

    window.addEventListener(
      "pulseiq-dataset-updated",
      buildNotifications
    );

    window.addEventListener(
      "storage",
      buildNotifications
    );

    return () => {
      window.removeEventListener(
        "pulseiq-data-updated",
        buildNotifications
      );

      window.removeEventListener(
        "pulseiq-dataset-updated",
        buildNotifications
      );

      window.removeEventListener(
        "storage",
        buildNotifications
      );
    };
  }, []);


  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem(
      "pulseiq_logged_in"
    );

    setShowProfile(false);

    navigate("/login");
  };


  /* =========================================================
     ROUTE CHANGE
  ========================================================= */

  useEffect(() => {
    setShowSearchResults(false);
    setShowNotification(false);
    setShowProfile(false);
  }, [location.pathname]);


  /* =========================================================
     JSX
  ========================================================= */

  return (
    <header className="dashboard-topbar">

      {/* SEARCH */}

      <div className="topbar-search-wrapper">

        <div className="topbar-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search dashboard..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => {
              if (search.trim()) {
                setShowSearchResults(true);
              }
            }}
            onKeyDown={handleSearch}
          />

          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => {
                setSearch("");
                setShowSearchResults(false);
              }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}

        </div>


        {showSearchResults && search.trim() && (
          <div className="search-results">

            {filteredSearchPages.length > 0 ? (
              filteredSearchPages.map((page) => {
                const Icon = page.icon;

                return (
                  <button
                    key={page.id}
                    type="button"
                    className="search-result-item"
                    onClick={() =>
                      goToSearchResult(page)
                    }
                  >

                    <div className="search-result-icon">
                      <Icon size={16} />
                    </div>

                    <div className="search-result-text">
                      <strong>
                        {page.title}
                      </strong>

                      <span>
                        {page.description}
                      </span>
                    </div>

                  </button>
                );
              })
            ) : (
              <div className="search-no-results">
                No PulseIQ page found
              </div>
            )}

          </div>
        )}

      </div>


      {/* RIGHT SIDE */}

      <div className="topbar-actions">

        {/* NOTIFICATION */}

        <div className="topbar-notification">

          <button
            type="button"
            className="topbar-icon"
            onClick={() => {
              setShowNotification(
                !showNotification
              );

              setShowProfile(false);
              setShowSearchResults(false);
            }}
            aria-label="Notifications"
          >

            <Bell size={19} />

            {notifications.length > 0 && (
              <span className="notification-dot">
                {notifications.length > 9
                  ? "9+"
                  : notifications.length}
              </span>
            )}

          </button>


          {showNotification && (
            <div className="topbar-dropdown notification-dropdown">

              <div className="dropdown-heading">

                <div>
                  <strong>
                    Notifications
                  </strong>

                  <span>
                    Latest business activity
                  </span>
                </div>

                <span className="notification-count">
                  {notifications.length}
                </span>

              </div>


              <div className="notification-list">

                {notifications.map(
                  (notification) => {
                    const Icon =
                      notification.icon;

                    return (
                      <div
                        key={notification.id}
                        className={`notification-item notification-${notification.type}`}
                      >

                        <div className="notification-icon">
                          <Icon size={16} />
                        </div>

                        <div className="notification-content">

                          <strong>
                            {notification.title}
                          </strong>

                          <span>
                            {notification.message}
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}

        </div>


        {/* PROFILE */}

        <div className="administrator-wrapper">

          <button
            type="button"
            className="administrator"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotification(false);
              setShowSearchResults(false);
            }}
          >

            {/* Avatar */}

            <div className="administrator-avatar">
              {userInitial}
            </div>


            {/* USER NAME */}

            <div className="administrator-info">

              <strong>
                {cleanUserName}
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


          {/* PROFILE DROPDOWN */}

          {showProfile && (
            <div className="administrator-menu">

              <div className="admin-menu-header">

                <div className="administrator-avatar large">
                  {userInitial}
                </div>


                <div className="admin-menu-user-info">

                  <strong>
                    {cleanUserName}
                  </strong>

                  <span>
                    {user?.email ||
                      "Administrator"}
                  </span>

                </div>

              </div>


              <div className="admin-menu-divider"></div>


              <button
                type="button"
                onClick={() => {
                  setShowProfile(false);
                  navigate("/settings");
                }}
              >

                <Settings size={16} />

                <span>
                  Settings
                </span>

              </button>


              <button
                type="button"
                className="logout-menu-button"
                onClick={handleLogout}
              >

                <LogOut size={16} />

                <span>
                  Logout
                </span>

              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default Topbar;