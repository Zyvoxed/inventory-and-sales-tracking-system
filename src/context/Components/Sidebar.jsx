import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaTags,
  FaShoppingCart,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { path: "/", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/products", label: "Products", icon: <FaBox /> },
    { path: "/categories", label: "Categories", icon: <FaTags /> },
    { path: "/sales", label: "Sales", icon: <FaChartBar /> },
    { path: "/settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-header">Storix</h2>

      <nav className="sidebar-menu">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${
              location.pathname === link.path ? "active" : ""
            }`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link
          to="/logout"
          className={`sidebar-link ${
            location.pathname === "/logout" ? "active" : ""
          }`}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
