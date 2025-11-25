// src/App.jsx
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

import { ThemeProvider } from "./Context/ThemeContext";
import "./assets/styles/App.css";

function AppLayout() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // we want to hide Sidebar/Topbar for the login page
  const publicRoutes = ["/admin-login", "/"];
  const hideLayout = publicRoutes.includes(location.pathname.toLowerCase());

  return (
    <div className="app-layout">
      {!hideLayout && user?.role === "Admin" && <Sidebar />}
      <div className="app-content">
        {!hideLayout && user?.role === "Admin" && <Topbar />}

        <Routes>
          {/* default / goes to admin login */}
          <Route path="/" element={<Navigate to="/admin-login" />} />

          {/* Admin Login */}
          <Route path="/admin-login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/dashboard"
            element={user?.role === "Admin" ? <Dashboard /> : <Navigate to="/admin-login" />}
          />

          <Route
            path="/products"
            element={user?.role === "Admin" ? <Products /> : <Navigate to="/admin-login" />}
          />

          <Route
            path="/sales"
            element={user?.role === "Admin" ? <Sales /> : <Navigate to="/admin-login" />}
          />

          <Route
            path="/settings"
            element={user?.role === "Admin" ? <Accounts /> : <Navigate to="/admin-login" />}
          />

          {/* Cashier route: only accessible to Cashier role */}
          <Route
            path="/cashier"
            element={user?.role === "Cashier" ? <Cashier /> : <Navigate to="/admin-login" />}
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
