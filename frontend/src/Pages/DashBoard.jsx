// src/Pages/DashBoard.jsx
import React, { useState, useEffect } from "react";
import DashboardCards from "../Components/DashboardCards";
import SalesChart from "../Components/SalesChart";
import "../assets/styles/Dashboard.css";

function DashBoard() {
  const [apiData, setApiData] = useState([]);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    loadProducts();
  }, []);

  // Load Products
  const loadProducts = () => {
    fetch("http://localhost:8081/product")
      .then((res) => res.json())
      .then((data) => setApiData(data))
      .catch((err) => console.log("Error loading products:", err));
  };

  // Stock Filter Logic
  const MAX_STOCK = 100;

  const filteredStock = apiData
    .filter((item) => {
      if (filter === "Low Stock") return Number(item.Stock) > 0 && Number(item.Stock) < 20;
      if (filter === "Out of Stock") return Number(item.Stock) === 0;
      return true;
    })
    .sort((a, b) => {
      if (filter === "All") return Number(b.Stock) - Number(a.Stock);
      return 0;
    });

  const lowStockItems = apiData.filter(
    (item) => Number(item.Stock) > 0 && Number(item.Stock) < 20
  );

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      {/* TOP CARDS */}
      <DashboardCards apiData={apiData} />

      <div className="main-grid">
        {/* LEFT — SALES CHART */}
        <div className="chart-box">
          <h3>Sales by Category</h3>
          <SalesChart />
        </div>

        {/* RIGHT — STOCK LEVEL */}
        <div className="chart-box stock-box">
          <div className="stock-header">
            <h3>Stock Level</h3>

            <div className="dropdown">
              <button
                className={`dropdown-btn ${open ? "open" : ""}`}
                onClick={() => setOpen(!open)}
              >
                {filter} <span className="arrow"></span>
              </button>

              {open && (
                <div className="dropdown-menu">
                  <ul>
                    <li
                      onClick={() => {
                        setFilter("All");
                        setOpen(false);
                      }}
                    >
                      All Items
                    </li>

                    <li
                      onClick={() => {
                        setFilter("Low Stock");
                        setOpen(false);
                      }}
                    >
                      Low Stock
                    </li>

                    <li
                      onClick={() => {
                        setFilter("Out of Stock");
                        setOpen(false);
                      }}
                    >
                      Out of Stock
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* STOCK BAR LIST */}
          <div className="stock-list">
            {filteredStock.map((item) => {
              const percent =
                item.Stock && MAX_STOCK > 0
                  ? Math.min((Number(item.Stock) / MAX_STOCK) * 100, 100)
                  : 0;

              return (
                <div key={item.ID} className="stock-item">
                  <div className="stock-item-header">
                    <span className="name">{item.Name}</span>
                    <span className="qty">{item.Stock} units remaining</span>
                  </div>

                  <div className="bar">
                    <div style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LOW STOCK ALERTS */}
      <div className="restock-box">
        <h3>Low Stock Alerts</h3>

        <div className="restock-list">
          {lowStockItems.length === 0 ? (
            <p>All products are sufficiently stocked</p>
          ) : (
            lowStockItems.map((item) => (
              <div key={item.ID} className="restock-item">
                <span className="restock-name">{item.Name}</span>
                <span className="restock-warning">
                  {item.Stock < 10
                    ? `Critical: ${item.Stock} units`
                    : `Low: ${item.Stock} units`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
