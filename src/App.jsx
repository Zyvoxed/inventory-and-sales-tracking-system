import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Topbar from "./Components/Topbar";
import Dashboard from "./Pages/DashBoard";
import Products from "./Pages/Products";
import Sales from "./Pages/Sales";
import Settings from "./Pages/Settings";
import AdminLogin from "./Pages/Login";
import { ThemeProvider } from "./Context/ThemeContext";
import "./assets/styles/App.css";
import { useState } from "react";

function AppLayout() {
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const publicRoutes = ["/admin-login"];
  const hideLayout = publicRoutes.includes(location.pathname.toLowerCase());

  return (
    <div className="app-layout">
      {!hideLayout && <Sidebar />}
      <div className="app-content">
        {!hideLayout && <Topbar />}
        <Routes>
          <Route path="/*" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin-login" element={<AdminLogin onLogin={() => setIsLoggedIn(true)} />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppLayout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
