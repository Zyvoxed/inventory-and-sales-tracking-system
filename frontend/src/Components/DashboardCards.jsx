import React, { useEffect, useState } from "react";
import "../assets/styles/Dashboard.css";

export default function DashboardCards({ apiData = [] }) {
  const [topItems, setTopItems] = useState([]);

  // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
  //  AUTO-GENERATED DASHBOARD STATS (MySQL data)
  // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

  const totalItems = apiData.length;

  const totalStock = apiData.reduce((total, item) => {
    return total + Number(item.Stock || 0);
  }, 0);

  const lowStock = apiData.filter(
    (item) => Number(item.Stock) > 0 && Number(item.Stock) < 20
  ).length;

  const outOfStock = apiData.filter((item) => Number(item.Stock) === 0).length;

  const cards = [
    { title: "Total Products", value: totalItems },
    { title: "Total Stock", value: totalStock },
    { title: "Low Stock", value: lowStock },
    { title: "Out of Stock", value: outOfStock },
  ];

  // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
  //  COMPUTE TOP ITEMS BASED ON TOTAL SALES AMOUNT
  // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
  useEffect(() => {
    const salesMap = {};

    apiData.forEach((item) => {
      const soldQty = Number(item.Sold || 0);
      const price = Number(item.Price || 0);

      if (soldQty > 0) {
        if (!salesMap[item.Name]) {
          salesMap[item.Name] = {
            ...item,
            totalSold: soldQty,
            totalAmount: soldQty * price, // subtotal
          };
        } else {
          salesMap[item.Name].totalSold += soldQty;
          salesMap[item.Name].totalAmount += soldQty * price;
        }
      }
    });

    const sorted = Object.values(salesMap)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5); // top 5 items

    setTopItems(sorted);
  }, [apiData]);

  return (
    <div className="cards-grid">
      {/* SUMMARY CARDS */}
      {cards.map((card, i) => (
        <div key={i} className="card-box">
          <h4>{card.title}</h4>
          <p>{card.value}</p>
        </div>
      ))}

      {/* TOP ITEMS CARD */}
      <div className="top-items-card scroll-card">
        <h3>Top Items</h3>

        <div className="scroll-list">
          {topItems.length === 0 ? (
            <p>No top items yet</p>
          ) : (
            topItems.map((item, index) => (
              <div key={index} className="scroll-item">
                <div>
                  <span className="item-name">{item.Name}</span>
                  <br />
                  <span className="item-qty">Category: {item.Category}</span>
                  <br />
                  <span className="item-qty">
                    Sold: {item.totalSold} pcs
                  </span>
                </div>

                <span className="item-value">
                  ₱{item.totalAmount.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
