import React from "react";
import "../assets/styles/Dashboard.css";

export default function DashboardCards({ topItems }) {
  const cards = [
    { title: "Total Products", value: "12,345" },
    { title: "Available Stock", value: "1,234" },
    { title: "Low Stock", value: "123" },
    { title: "Out of Stock", value: "34" },
  ];

  return (
    <div className="cards-grid">
      {cards.map((card, i) => (
        <div key={i} className="card-box">
          <h4>{card.title}</h4>
          <p>{card.value}</p>
        </div>
      ))}

      {/* 🟦 TOP ITEMS SCROLL CARD */}
      <div className="top-items-card scroll-card">
        <h3>Top Selling Items</h3>

        <div className="scroll-list">
          {topItems.length === 0 ? (
            <p>No items found</p>
          ) : (
            topItems.map((item) => (
              <div key={item.id} className="scroll-item">
                <div>
                  <span className="item-name">{item.item}</span>
                  <br />
                  <span className="item-qty">Qty: {item.qty}</span>
                </div>
                <span className="item-value">₱{item.total}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
