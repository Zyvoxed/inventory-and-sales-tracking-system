import { useState } from "react";

export default function Sales() {
  const [sales, setSales] = useState([
    { id: 1, item: "T-Shirt", qty: 2, total: 398 },
    { id: 2, item: "Sneakers", qty: 1, total: 799 },
  ]);

  const [newSale, setNewSale] = useState({ item: "", qty: "", total: "" });
  const [editIndex, setEditIndex] = useState(null);

  // Add or update sale
  const addOrUpdateSale = (e) => {
    e.preventDefault();
    if (!newSale.item.trim() || !newSale.qty || !newSale.total) return;

    if (editIndex !== null) {
      const confirmUpdate = window.confirm(
        "Are you sure you want to update this sale?"
      );
      if (!confirmUpdate) return;

      setSales((prev) =>
        prev.map((sale, idx) =>
          idx === editIndex ? { ...newSale, id: sale.id } : sale
        )
      );
      setEditIndex(null);
    } else {
      const confirmAdd = window.confirm(
        "Are you sure you want to add this sale?"
      );
      if (!confirmAdd) return;

      setSales([...sales, { ...newSale, id: Date.now() }]);
    }

    setNewSale({ item: "", qty: "", total: "" });
  };

  // Edit sale
  const handleEdit = (index) => {
    const confirmEdit = window.confirm("Do you want to edit this sale?");
    if (!confirmEdit) return;

    setNewSale({
      item: sales[index].item,
      qty: sales[index].qty,
      total: sales[index].total,
    });
    setEditIndex(index);
  };

  // Delete sale
  const handleDelete = (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sale?"
    );
    if (!confirmDelete) return;

    setSales(sales.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
      setNewSale({ item: "", qty: "", total: "" });
    }
  };

  // Calculate total sales
  const totalSales = sales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0
  );

  return (
    <div className="dashboard">
      <h1>Sales</h1>

      <div className="card">
        <h2>{editIndex !== null ? "Edit Sale" : "Add Sale"}</h2>
        <form onSubmit={addOrUpdateSale}>
          <input
            type="text"
            placeholder="Item name"
            value={newSale.item}
            onChange={(e) => setNewSale({ ...newSale, item: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newSale.qty}
            onChange={(e) => setNewSale({ ...newSale, qty: e.target.value })}
          />
          <input
            type="number"
            placeholder="Total (₱)"
            value={newSale.total}
            onChange={(e) => setNewSale({ ...newSale, total: e.target.value })}
          />
          <button type="submit">{editIndex !== null ? "Update" : "Add"}</button>
        </form>
      </div>

      <div className="card">
        <h2>Sales Records</h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left" }}>
              <th style={{ padding: "10px" }}>Item</th>
              <th style={{ padding: "10px" }}>Quantity</th>
              <th style={{ padding: "10px" }}>Total (₱)</th>
              <th style={{ padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px" }}>{s.item}</td>
                <td style={{ padding: "10px" }}>{s.qty}</td>
                <td style={{ padding: "10px" }}>₱{s.total}</td>
                <td style={{ padding: "10px" }}>
                  <button
                    onClick={() => handleEdit(i)}
                    style={{
                      backgroundColor: "#9bb8e7ff",
                      color: "white",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      marginRight: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(i)}
                    style={{
                      backgroundColor: "#ec9494ff",
                      color: "white",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ Total Sales Summary */}
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
