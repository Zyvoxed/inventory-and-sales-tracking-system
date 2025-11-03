import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Topbar from "./Components/Topbar";
import Dashboard from "./Pages/Dashboard";
import Products from "./Pages/Products";
import Categories from "./Pages/Categories";
import Sales from "./Pages/Sales";
import Settings from "./Pages/Settings";
import Login from "./Pages/Login";
import { ThemeProvider } from "./Context/ThemeContext";
import "./assets/styles/App.css";

function AppLayout() {
  const location = useLocation();
  const publicRoutes = ["/login"]; // Add more if needed
  const hideLayout = publicRoutes.includes(location.pathname.toLowerCase());

  return (
    <div className="app-layout">
      {!hideLayout && <Sidebar />}
      <div className="app-content">
        {!hideLayout && <Topbar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
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
