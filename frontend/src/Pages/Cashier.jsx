// src/Pages/Cashier.jsx
import React from "react";
import Sidebar from "../Components/Sidebar";
import Dashboard from "../Pages/DashBoard";
import "../assets/styles/Accounts.css";

export default function Cashier() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <Dashboard />
    </div>
  );
}
