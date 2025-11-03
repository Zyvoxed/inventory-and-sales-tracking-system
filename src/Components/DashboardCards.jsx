import React from "react";
import "../assets/styles/DashboardCards.css";

export default function DashboardCards() {
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
    </div>
  );
}
