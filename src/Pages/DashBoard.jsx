import React, { useState } from "react";
import DashboardCards from "../Components/DashboardCards";
import SalesChart from "../Components/SalesChart";

export default function Dashboard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <DashboardCards />
      <div className="main-grid">
        <div className="chart-box">
          <h3>Sales by Category</h3>
          <SalesChart />
        </div>
        <div className="chart-box stock-box">
          <div className="stock-header">
            <h3>Stock Level</h3>
            <div className="dropdown">
              <button 
                className={`dropdown-btn ${open ? "open" : ""}`}
                onClick={() => setOpen(!open)}
              >
                Category <span className="arrow"></span>
              </button>
              {open && (
                <div className="dropdown-menu">
                  <ul>
                    <li>All Items</li>
                    <li>Low Stock</li>
                    <li>Out of Stock</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="restock-box">
        <h3>Restock</h3>
      </div>
    </div>
  );
}
