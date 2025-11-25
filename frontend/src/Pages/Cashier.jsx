// src/Pages/Cashier.jsx
import React from "react";
import "../assets/styles/Accounts.css"; // reuse styles (or create a new one)

export default function Cashier() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="dashboard">
      <h1 className="page-title">Cashier Panel</h1>

      <div style={{ marginTop: 16 }}>
        <h2>Welcome, {user?.fullname || "Cashier"}!</h2>
        <p>This will be your cashier POS interface. You can implement product search, add to cart, and checkout here.</p>
      </div>
    </div>
  );
}
