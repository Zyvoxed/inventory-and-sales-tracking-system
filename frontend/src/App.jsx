import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Sidebar from "./Components/Sidebar";
import Topbar from "./Components/Topbar";
import Dashboard from "./Pages/DashBoard";
import Products from "./Pages/Products";
import Sales from "./Pages/Sales";
import Accounts from "./Pages/Accounts";
import Login from "./Pages/Login";
import Cashier from "./Pages/Cashier";
import IncidentReport from "./Pages/IncidentReport";

import { ThemeProvider } from "./Context/ThemeContext";
import "./assets/styles/App.css";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
}

function AppLayout() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const publicRoutes = ["/admin-login", "/"];
  const hideLayout = publicRoutes.includes(location.pathname.toLowerCase());

  return (
    <div className="app-layout">
      {!hideLayout &&
        user &&
        !(user.role && user.role.toLowerCase() === "cashier") && <Sidebar />}

      <div className="app-content">
        {!hideLayout && user && <Topbar />}

        <Routes>
          <Route path="/" element={<Navigate to="/admin-login" />} />

          {/* Login */}
          <Route path="/admin-login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Accounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incident-report"
            element={
              <ProtectedRoute>
                <IncidentReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cashier"
            element={
              <ProtectedRoute>
                <Cashier />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/*" element={<Navigate to="/admin-login" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppLayout />
      </Router>
    </ThemeProvider>
  );
}
