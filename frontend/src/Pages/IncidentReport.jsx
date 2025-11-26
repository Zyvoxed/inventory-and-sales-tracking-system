import React from "react";
import Sidebar from "../Components/Sidebar";
import "../assets/styles/Accounts.css"; // same style as your example

export default function IncidentReport() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <Sidebar />
      {/* MAIN CONTENT */}
      <h1 className="page-title">Incident Report</h1>
      <p>This is a test page to confirm that Incident Report is working.</p>
    </div>
  );
}
