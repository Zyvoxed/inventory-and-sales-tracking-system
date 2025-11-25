import { useState, useEffect } from "react";
import axios from "axios";
import "../assets/styles/Sales.css";

export default function Sales() {
  const [salesList, setSalesList] = useState([]);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    axios
      .get("http://localhost:8081/sales")
      .then((res) => setSalesList(res.data))
      .catch(() => alert("Error loading sales"));
  };

  const deleteSale = (saleId) => {
    if (!window.confirm("Delete this sale and all its items?")) return;
    axios
      .delete(`http://localhost:8081/sale/${saleId}`)
      .then(() => {
        alert("Sale deleted!");
        loadSales();
      })
      .catch(() => alert("Error deleting sale"));
  };

  const formatDate12 = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour12: true,
    });
  };

  // Group sales by sale_id
  const groupedSales = salesList.reduce((acc, item) => {
    if (!acc[item.sale_id]) acc[item.sale_id] = [];
    acc[item.sale_id].push(item);
    return acc;
  }, {});

  const saveSale = () => {
    // Placeholder: actual sales are recorded by the cashier/POS.
    // Keep this button here so you can wire it to the POS flow later.
    alert("Use the cashier/POS to record a sale. This button is a placeholder.");
    loadSales();
  };

  return (
    <div className="dashboard">
      <h1 className="page-title">Sales History</h1>

      <table className="sales-table">
        <thead>
          <tr>
            <th>Products</th>
            <th>Qty</th>
            <th>Subtotal</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedSales).map(([saleId, items]) => (
            <tr key={saleId}>
              <td>{items.map((i) => i.product_name).join(", ")}</td>
              <td>{items.map((i) => i.quantity).join(", ")}</td>
              <td>₱{items.reduce((sum, i) => sum + i.subtotal, 0)}</td>
              <td>{formatDate12(items[0].sale_date)}</td>
              <td>
                <button onClick={() => deleteSale(saleId)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16 }}>
        <button onClick={saveSale} className="save-btn">
          Save Sale
        </button>
      </div>
    </div>
  );
}
