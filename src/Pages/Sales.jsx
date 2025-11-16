import { useState } from "react";
import "../assets/styles/Sales.css";

export default function Sales() {
  const [users] = useState([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);

  const [selectedUser, setSelectedUser] = useState(users[0].id);

  const salesData = {
    1: [
      { id: 1, item: "T-Shirt", qty: 2, total: 398 },
      { id: 2, item: "Sneakers", qty: 1, total: 799 },
    ],
    2: [
      { id: 3, item: "Hat", qty: 3, total: 597 },
      { id: 4, item: "Jacket", qty: 1, total: 1200 },
    ],
  };

  const userSales = salesData[selectedUser] || [];

  const totalSales = userSales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0
  );

  return (
    <div className="dashboard">
      <h1>Sales Report</h1>

      <div className="sales-form">
        <label htmlFor="user-select">Select User:</label>
        <select
          id="user-select"
          value={selectedUser}
          onChange={(e) => setSelectedUser(Number(e.target.value))}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sales-table-container">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Total (₱)</th>
            </tr>
          </thead>
          <tbody>
            {userSales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.item}</td>
                <td>{sale.qty}</td>
                <td>₱{sale.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            borderTop: "2px solid #cbd5e1",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ margin: 0 }}>Total Sales</h3>
          <h2 style={{ margin: 0, color: "#2563eb" }}>₱{totalSales}</h2>
        </div>
      </div>
    </div>
  );
}
