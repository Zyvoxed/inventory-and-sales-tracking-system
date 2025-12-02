import { useState, useEffect } from "react";
import axios from "axios";
import "../assets/styles/Sales.css";

export default function Sales() {
  const [salesList, setSalesList] = useState([]);
  const [showSort, setShowSort] = useState(false);
  const [sortOption, setSortOption] = useState("");
  const [search, setSearch] = useState(""); // Added search state
  // Helper to get today's date in local yyyy-mm-dd format
  const getTodayLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayLocalDateString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // ensure selected date defaults to today on mount/navigation
    setSelectedDate(getTodayLocalDateString());
    loadSales();
  }, []);

  const loadSales = () => {
    // Load both confirmed sales and pending cashier transactions
    Promise.all([
      axios.get("http://localhost:8081/sales"),
      axios.get("http://localhost:8081/pending-sales"),
    ])
      .then(([confirmed, pending]) => {
        // Combine arrays so both confirmed and pending entries appear in Sales History
        const combined = (confirmed.data || []).concat(pending.data || []);
        setSalesList(combined);
      })
      .catch((err) => {
        console.error("Error loading sales:", err);
        alert("Error loading sales");
      });
  };

  const deleteSale = (saleId) => {
    if (!window.confirm("Delete this sale and all its items?")) return;
    // pending sale ids are prefixed with 'pending_'
    if (String(saleId).startsWith("pending_")) {
      const id = saleId.split("_")[1];
      axios
        .delete(`http://localhost:8081/pending-sales/${id}`)
        .then(() => {
          alert("Pending item deleted!");
          loadSales();
        })
        .catch(() => alert("Error deleting pending item"));
      return;
    }

    axios
      .delete(`http://localhost:8081/sales/${saleId}`)
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

  // Helper: convert server datetime to local yyyy-mm-dd
  const toLocalDateString = (datetimeStr) => {
    const d = new Date(datetimeStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  // Filter by selected date (if provided)
  if (selectedDate) {
    salesArray = salesArray.filter((sale) => {
      const saleDateStr = toLocalDateString(sale.items[0].sale_date);
      return saleDateStr === selectedDate;
    });
  }

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

  const saveSale = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user.user_id) {
      alert("User not logged in!");
      return;
    }

    // Check if there are any pending sales for the selected date
    const hasPendingSales = salesList.some((item) => {
      const saleDateStr = toLocalDateString(item.sale_date);
      return saleDateStr === selectedDate && String(item.sale_id || "").startsWith("pending_");
    });

    if (!hasPendingSales) {
      alert(`No pending sales to save for ${selectedDate}`);
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post("http://localhost:8081/sales/save-pending", {
        user_id: user.user_id,
        sale_date: selectedDate,
      });
      alert(`Pending sales confirmed! Sale ID: ${res.data.sale_id}`);
      loadSales();
    } catch (err) {
      console.error("Save pending sale error:", err);
      alert(`Error saving sale: ${err.response?.data?.error || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard">
      <h1 className="page-title">Sales History</h1>

      <div className="top-controls">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Date Picker Dropdown */}
          <div className="sort-container">
            <button
              className="sales-sort-btn"
              onClick={() => setShowDatePicker(!showDatePicker)}
              style={{ background: "#2563eb" }}
            >
              📅 {selectedDate}
            </button>

            {showDatePicker && (
              <div className="sales-sort-dropdown">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setShowDatePicker(false);
                  }}
                  style={{ padding: "8px", cursor: "pointer" }}
                />
              </div>
            )}
          </div>

          <button
            onClick={saveSale}
            className="save-btn"
            disabled={saving}
            style={{ cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving..." : "Save Sale"}
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
            {(() => {
              // Render rows with date-category headers
              const rows = [];
              let prevDate = null;
              // Ensure salesArray is sorted by date desc for grouping
              const sorted = [...salesArray].sort((a, b) => b.date - a.date);
              for (const sale of sorted) {
                const saleDateStr = toLocalDateString(sale.items[0].sale_date);
                if (saleDateStr !== prevDate) {
                  rows.push(
                    <tr key={`header-${saleDateStr}`} className="date-header-row">
                      <td colSpan="5" style={{ fontWeight: 700, padding: "8px 12px" }}>
                        {new Date(saleDateStr).toLocaleDateString(undefined, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                  prevDate = saleDateStr;
                }

                rows.push(
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
                );
              }
              if (rows.length === 0) {
                return (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                      No sales found for {selectedDate}
                    </td>
                  </tr>
                );
              }
              return rows;
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
