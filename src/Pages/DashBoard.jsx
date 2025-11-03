import React from "react";
import DashboardCards from "../Components/DashboardCards";
import SalesChart from "../Components/SalesChart";
import "../assets/styles/Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h2 className="page-title">Dashboard</h2>

      {/* Summary Cards */}
      <DashboardCards />

      {/* Main layout */}
      <div className="main-grid">
        <div className="left-grid">
          <div className="chart-box">
            <h3>Sales by Category</h3>
            <SalesChart />
          </div>
          <div className="chart-box">
            <h3>Orders Summary</h3>
          </div>
          <div className="chart-box">
            <h3>Top item categories</h3>
          </div>
          <div className="chart-box">
            <h3>Restock</h3>
          </div>
        </div>

        <div className="right-grid">
          <div className="activity-box">
            <h3>Recent Activity</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
