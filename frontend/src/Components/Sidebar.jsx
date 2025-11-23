import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "../assets/styles/Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        {/* DISCOVER SECTION */}
        <h2 className="sidebar-section">DISCOVER</h2>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
          end
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>

        {/* INVENTORY SECTION */}
        <h2 className="sidebar-section">INVENTORY</h2>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <FaBox />
          <span>Products</span>
        </NavLink>
        <NavLink
          to="/sales"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <FaChartBar />
          <span>Sales</span>
        </NavLink>

        {/* SETTINGS SECTION */}
        <h2 className="sidebar-section">ACCOUNT SETTINGS</h2>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <FaCog />
          <span>Accounts</span>
        </NavLink>
      </nav>

      {/* LOGOUT AT THE BOTTOM */}
      <div className="sidebar-footer">
        <NavLink
          to="/admin-login"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}
