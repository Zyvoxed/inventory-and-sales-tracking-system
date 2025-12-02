import { useState, useEffect } from "react";
import axios from "axios";
import "../assets/styles/Sales.css";

export default function Sales() {
  const [salesList, setSalesList] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);
  const loadSales = () => {
    axios
      .get("http://localhost:8081/sales")
      .then((res) => setSalesList(res.data))
      .catch(() => alert("Error loading sales"));
  };

  const deleteSale = (id) => {
    if (!window.confirm("Delete sale?")) return;
    axios
      .delete(`http://localhost:8081/sales/${id}`)
      .then(() => {
        alert("Sale deleted");
        loadSales();
      })
      .catch(() => alert("Error deleting sale"));
  };

  const formatDate12 = (d) =>
    new Date(d).toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour12: true,
    });

  const grouped = salesList.reduce((acc, item) => {
    if (!acc[item.sale_id]) acc[item.sale_id] = [];
    acc[item.sale_id].push(item);
    return acc;
  }, {});
  let salesArray = Object.entries(grouped).map(([id, items]) => ({
    saleId: id,
    items,
    subtotal: items.reduce((s, i) => s + i.subtotal, 0),
    qty: items.reduce((s, i) => s + i.quantity, 0),
    date: new Date(items[0].sale_date),
  }));

  // Filter & Sort
  salesArray = salesArray.filter((s) =>
    s.items.some((i) =>
      i.product_name.toLowerCase().includes(search.toLowerCase())
    )
  );
  if (sortOption === "date-asc") salesArray.sort((a, b) => a.date - b.date);
  if (sortOption === "date-desc") salesArray.sort((a, b) => b.date - a.date);
  if (sortOption === "subtotal-asc")
    salesArray.sort((a, b) => a.subtotal - b.subtotal);
  if (sortOption === "subtotal-desc")
    salesArray.sort((a, b) => b.subtotal - a.subtotal);
  if (sortOption === "qty-asc") salesArray.sort((a, b) => a.qty - b.qty);
  if (sortOption === "qty-desc") salesArray.sort((a, b) => b.qty - a.qty);

  return (
    <div className="dashboard">
      <h1>Sales History</h1>
      <input
        placeholder="Search items"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={() => setShowSort((prev) => !prev)}>⇅ Sort By</button>
      {showSort && (
        <div>
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
                <button onClick={() => deleteSale(sale.saleId)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
