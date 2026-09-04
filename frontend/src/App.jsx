import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import PublicPages from "./pages/publicpages";

import DashboardLayout from "./components/dashboard/dashboardlayout";

import Analytics from "./pages/Analytics";
import Customers from "./pages/customers";
import UploadData from "./pages/uploaddata";
import Invoice from "./pages/invoice";
import Settings from "./pages/Settings";
import PrismAI from "./components/dashboard/prismai";
import Reports from "./pages/Reports";
import Expenses from "./pages/expenses";


function ProtectedRoute({ children }) {
  const loggedIn =
    localStorage.getItem("pulseiq_logged_in") === "true";

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />


        {/* PUBLIC WEBSITE PAGES */}

        <Route
          path="/features"
          element={<PublicPages />}
        />

        <Route
          path="/about"
          element={<PublicPages />}
        />

        <Route
          path="/why"
          element={<PublicPages />}
        />

        <Route
          path="/pricing"
          element={<PublicPages />}
        />

        <Route
          path="/contact"
          element={<PublicPages />}
        />


        {/* AUTH */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />


        {/* ANALYTICS */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />


        {/* REPORTS */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />


        {/* CUSTOMERS */}

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />


        {/* UPLOAD DATA */}

        <Route
          path="/uploaddata"
          element={
            <ProtectedRoute>
              <UploadData />
            </ProtectedRoute>
          }
        />


        {/* ALTERNATIVE UPLOAD URL */}

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadData />
            </ProtectedRoute>
          }
        />


        {/* INVOICE */}

        <Route
          path="/invoice"
          element={
            <ProtectedRoute>
              <Invoice />
            </ProtectedRoute>
          }
        />


        {/* EXPENSES */}

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />


        {/* PRISM AI */}

        <Route
          path="/prismai"
          element={
            <ProtectedRoute>
              <PrismAI />
            </ProtectedRoute>
          }
        />


        {/* SETTINGS */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;