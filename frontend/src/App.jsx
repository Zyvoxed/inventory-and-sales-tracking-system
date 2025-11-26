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

function AppLayout() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const publicRoutes = ["/admin-login", "/"];
  const hideLayout = publicRoutes.includes(location.pathname.toLowerCase());

  return (
    <div className="app-layout">
      {/* Show sidebar except when on public routes OR logged-in user is a Cashier */}
      {!hideLayout &&
        user &&
        !(user.role && user.role.toLowerCase() === "cashier") && <Sidebar />}

      <div className="app-content">
        {!hideLayout && user && <Topbar />}

        <Routes>
          <Route path="/" element={<Navigate to="/admin-login" />} />

          {/* Login */}
          <Route path="/admin-login" element={<Login />} />

          {/* Shared routes (Admin & Cashier) */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/admin-login" />}
          />

          <Route
            path="/products"
            element={user ? <Products /> : <Navigate to="/admin-login" />}
          />

          <Route
            path="/sales"
            element={user ? <Sales /> : <Navigate to="/admin-login" />}
          />

          <Route
            path="/settings"
            element={user ? <Accounts /> : <Navigate to="/admin-login" />}
          />

          {/* INCIDENT REPORT (NEW) */}
          <Route
            path="/incident-report"
            element={user ? <IncidentReport /> : <Navigate to="/admin-login" />}
          />

          {/* Cashier */}
          <Route
            path="/cashier"
            element={user ? <Cashier /> : <Navigate to="/admin-login" />}
          />

          {/* Fallback */}
          <Route path="/*" element={<Navigate to="/admin-login" />} />
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
