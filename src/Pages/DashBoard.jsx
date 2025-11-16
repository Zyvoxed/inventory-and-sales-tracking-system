import React, { useState } from "react";
import DashboardCards from "../Components/DashboardCards";
import SalesChart from "../Components/SalesChart";

export default function Dashboard() {
  const [open, setOpen] = useState(false);

  // 🟦 SAMPLE SALES DATA TO FEED TOP ITEMS CARD
  const salesData = [
    { id: 1, item: "T-Shirt", qty: 2, total: 398 },
    { id: 2, item: "Sneakers", qty: 1, total: 799 },
    { id: 3, item: "Hat", qty: 3, total: 597 },
    { id: 4, item: "Gym Gloves", qty: 1, total: 1200 },
    { id: 5, item: "Jacket", qty: 1, total: 1200 },
    { id: 6, item: "T-shirts", qty: 1, total: 1200 },
    { id: 7, item: "Shoes", qty: 1, total: 123 },
    { id: 8, item: "Jacket", qty: 1, total: 1230 },
    { id: 9, item: "Jacket", qty: 1, total: 2940193 },
    { id: 10, item: "Jacket", qty: 1, total: 23131 },
  ];

  // 🟩 SORT HIGHEST SELLING ITEMS
  const topItems = [...salesData].sort((a, b) => b.total - a.total);

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      {/* PASS THE SORTED ITEMS */}
      <DashboardCards topItems={topItems} />

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

          {/* STOCK LIST */}
          <div className="stock-list">
            <div className="stock-item">
              <div className="stock-item-header">
                <span className="name">Mizuno Jersey</span>
                <span className="qty">28 of 120 remaining</span>
              </div>
              <div className="bar">
                <div style={{ width: "23%" }}></div>
              </div>
            </div>

            <div className="stock-item">
              <div className="stock-item-header">
                <span className="name">Jump Rope</span>
                <span className="qty">44 of 90 remaining</span>
              </div>
              <div className="bar">
                <div style={{ width: "35%" }}></div>
              </div>
            </div>

            <div className="stock-item">
              <div className="stock-item-header">
                <span className="name">Agility Cones</span>
                <span className="qty">47 of 95 remaining</span>
              </div>
              <div className="bar">
                <div style={{ width: "69%" }}></div>
              </div>
            </div>

            <div className="stock-item">
              <div className="stock-item-header">
                <span className="name">Shuttlecock Tube</span>
                <span className="qty">70 of 130 remaining</span>
              </div>
              <div className="bar">
                <div style={{ width: "87%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="restock-box">
        <h3>Low Stock Alerts</h3>

        <div className="restock-list">
          <div className="restock-item">
            <span className="restock-name">Mizuno Jersey</span>
            <span className="restock-warning">Only 5 left!</span>
          </div>

          <div className="restock-item">
            <span className="restock-name">Agility Cones</span>
            <span className="restock-warning">Low: 8 units</span>
          </div>

          <div className="restock-item">
            <span className="restock-name">Shuttlecock Tube</span>
            <span className="restock-warning">Critical: 3 units</span>
          </div>
        </div>
      </div>
    </div>
  );
}
