import React from "react";
import "../assets/styles/Dashboard.css";

export default function DashboardCards({ apiData = [] }) {
  // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
  //  AUTO-GENERATED DASHBOARD STATS (MySQL data)
  // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

  // Total items
  const totalItems = apiData.length;

  // Total Stock = sum of all item.Stock values
  const totalStock = apiData.reduce((total, item) => {
    return total + Number(item.Stock || 0);
  }, 0);

  // Low stock = Stock < 10
  const lowStock = apiData.filter(
    (item) => Number(item.Stock) > 0 && Number(item.Stock) < 20
  ).length;

  // Out of stock = Stock = 0
  const outOfStock = apiData.filter((item) => Number(item.Stock) === 0).length;

  // Dynamic cards (replaces static)
  const cards = [
    { title: "Total Products", value: totalItems },
    { title: "Total Stock", value: totalStock },
    { title: "Low Stock", value: lowStock },
    { title: "Out of Stock", value: outOfStock },
  ];

  return (
    <div className="cards-grid">
      {/* SUMMARY CARDS (Now Dynamic) */}
      {cards.map((card, i) => (
        <div key={i} className="card-box">
          <h4>{card.title}</h4>
          <p>{card.value}</p>
        </div>
      ))}

      {/* DO NOT TOUCH THIS — Top Items List */}
      <div className="top-items-card scroll-card">
        <h3>Top Items</h3>

        <div className="scroll-list">
          {apiData.length === 0 ? (
            <p>No data loaded</p>
          ) : (
            apiData.map((item) => (
              <div key={item.id} className="scroll-item">
                <div>
                  <span className="item-name">{item.Name}</span>
                  <br />
                  <span className="item-qty">Category: {item.Category}</span>
                  <br />
                  <span className="item-qty">Stock: {item.Stock}</span>
                </div>

                <span className="item-value">₱{item.Price}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
