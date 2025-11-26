import { useState, useEffect } from "react";
import axios from "axios";
import "../assets/styles/Sales.css";

export default function Sales() {
  const [salesList, setSalesList] = useState([]);
  const [showSort, setShowSort] = useState(false);
  const [sortOption, setSortOption] = useState("");
  const [search, setSearch] = useState(""); // Added search state

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

  // Convert groupedSales object to array for sorting
  let salesArray = Object.entries(groupedSales).map(([saleId, items]) => ({
    saleId,
    items,
    subtotal: items.reduce((sum, i) => sum + i.subtotal, 0),
    qty: items.reduce((sum, i) => sum + i.quantity, 0),
    date: new Date(items[0].sale_date),
  }));

  // Apply search filter
  salesArray = salesArray.filter((sale) =>
    sale.items.some((i) =>
      i.product_name.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Apply dynamic sorting
  if (sortOption === "date-asc") salesArray.sort((a, b) => a.date - b.date);
  if (sortOption === "date-desc") salesArray.sort((a, b) => b.date - a.date);
  if (sortOption === "subtotal-asc")
    salesArray.sort((a, b) => a.subtotal - b.subtotal);
  if (sortOption === "subtotal-desc")
    salesArray.sort((a, b) => b.subtotal - a.subtotal);
  if (sortOption === "qty-asc") salesArray.sort((a, b) => a.qty - b.qty);
  if (sortOption === "qty-desc") salesArray.sort((a, b) => b.qty - a.qty);

  const saveSale = () => {
    alert(
      "Use the cashier/POS to record a sale. This button is a placeholder."
    );
    loadSales();
  };

  return (
    <div className="dashboard">
      <h1 className="page-title">Sales History</h1>

      <div className="top-controls">
        <div>
          <button onClick={saveSale} className="save-btn">
            Save Sale
          </button>
        </div>
        <input
          type="text"
          placeholder="Search items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* SORT BUTTON */}
        <div className="sort-container">
          <button
            className="sales-sort-btn"
            onClick={() => setShowSort(!showSort)}
          >
            ⇅ Sort By
          </button>

          {showSort && (
            <div className="sales-sort-dropdown">
              <p
                onClick={() => {
                  setSortOption("date-asc");
                  setShowSort(false);
                }}
              >
                Date: Old → New
              </p>
              <p
                onClick={() => {
                  setSortOption("date-desc");
                  setShowSort(false);
                }}
              >
                Date: New → Old
              </p>
              <p
                onClick={() => {
                  setSortOption("subtotal-asc");
                  setShowSort(false);
                }}
              >
                Subtotal: Low → High
              </p>
              <p
                onClick={() => {
                  setSortOption("subtotal-desc");
                  setShowSort(false);
                }}
              >
                Subtotal: High → Low
              </p>
              <p
                onClick={() => {
                  setSortOption("qty-asc");
                  setShowSort(false);
                }}
              >
                Qty: Low → High
              </p>
              <p
                onClick={() => {
                  setSortOption("qty-desc");
                  setShowSort(false);
                }}
              >
                Qty: High → Low
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SALES TABLE */}
      <div className="sales-table-container">
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
            {salesArray.map((sale) => (
              <tr key={sale.saleId}>
                <td>{sale.items.map((i) => i.product_name).join(", ")}</td>
                <td>{sale.qty}</td>
                <td>₱{sale.subtotal}</td>
                <td>{formatDate12(sale.items[0].sale_date)}</td>
                <td>
                  <button onClick={() => deleteSale(sale.saleId)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
