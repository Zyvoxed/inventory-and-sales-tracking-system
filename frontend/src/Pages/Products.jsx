import { useState, useEffect } from "react";
import "../assets/styles/Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [form, setForm] = useState({
    Name: "",
    Category: "",
    Stock: "",
    Price: "",
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showSort, setShowSort] = useState(false);
  const [sortOption, setSortOption] = useState("");

  // Get current logged-in user ID
  const currentUserId = Number(localStorage.getItem("currentUserId"));

  // -------------------------------
  // Load Products
  // -------------------------------
  const loadProducts = () => {
    fetch("http://localhost:8081/product")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((p) => ({
          ...p,
          CreatedAt: p.CreatedAt
            ? new Date(p.CreatedAt.replace(" ", "T")).toLocaleString("en-GB", {
                hour12: true,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          UpdatedAt: p.UpdatedAt
            ? new Date(p.UpdatedAt.replace(" ", "T")).toLocaleString("en-GB", {
                hour12: true,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
        }));

        setProducts(mapped);
        setCategories(["All", ...new Set(mapped.map((p) => p.Category))]);
      })
      .catch((err) => console.log("Fetch error:", err));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // -------------------------------
  // Add / Edit Product
  // -------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.Name || !form.Stock || !form.Price)
      return alert("Please fill all required fields");

    const payload = {
      product_name: form.Name,
      category: form.Category,
      quantity_in_stock: Number(form.Stock),
      price: Number(form.Price),
      userId: currentUserId, // Include user ID for audit log
    };

    const url = editId
      ? `http://localhost:8081/product/${editId}`
      : "http://localhost:8081/product";
    const method = editId ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((msg) => {
        alert(msg.success || msg.error);
        setForm({ Name: "", Category: "", Stock: "", Price: "" });
        setEditId(null);
        loadProducts();
      });
  };

  // -------------------------------
  // Edit / Delete Product
  // -------------------------------
  const handleEdit = (p) => {
    setEditId(p.ID);
    setForm({
      Name: p.Name,
      Category: p.Category,
      Stock: p.Stock,
      Price: p.Price,
    });
  };

  const handleDelete = (ID) => {
    if (!ID || !window.confirm("Delete this product?")) return;

    fetch(`http://localhost:8081/product/${ID}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId }), // Pass user ID
    })
      .then((res) => res.json())
      .then((msg) => {
        alert(msg.success || msg.error);
        loadProducts();
      });
  };

  // -------------------------------
  // Filter & Sort
  // -------------------------------
  let filteredProducts = products.filter(
    (p) =>
      (p.Name ?? "").toLowerCase().includes(search.toLowerCase()) &&
      (activeCategory === "All" || p.Category === activeCategory)
  );

  if (sortOption === "stock-asc")
    filteredProducts.sort((a, b) => a.Stock - b.Stock);
  if (sortOption === "stock-desc")
    filteredProducts.sort((a, b) => b.Stock - a.Stock);
  if (sortOption === "price-asc")
    filteredProducts.sort((a, b) => a.Price - b.Price);
  if (sortOption === "price-desc")
    filteredProducts.sort((a, b) => b.Price - a.Price);

  return (
    <div className="dashboard">
      <h1 className="page-title">Products</h1>

      {/* Top Controls */}
      <div className="top-controls">
        <input
          type="text"
          placeholder="Search items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="sort-container">
          <button className="sort-btn" onClick={() => setShowSort(!showSort)}>
            ⇅ Sort By
          </button>
          {showSort && (
            <div className="sort-dropdown">
              <p
                onClick={() => {
                  setSortOption("stock-asc");
                  setShowSort(false);
                }}
              >
                Stock: Low → High
              </p>
              <p
                onClick={() => {
                  setSortOption("stock-desc");
                  setShowSort(false);
                }}
              >
                Stock: High → Low
              </p>
              <p
                onClick={() => {
                  setSortOption("price-asc");
                  setShowSort(false);
                }}
              >
                Price: Low → High
              </p>
              <p
                onClick={() => {
                  setSortOption("price-desc");
                  setShowSort(false);
                }}
              >
                Price: High → Low
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={activeCategory === cat ? "active" : ""}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Table */}
      <div className="content-grid">
        <div className="product-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.ID}>
                  <td>{p.Name}</td>
                  <td>{p.Category}</td>
                  <td>{p.Stock}</td>
                  <td>₱{p.Price}</td>
                  <td>{p.CreatedAt}</td>
                  <td>{p.UpdatedAt}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(p)}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(p.ID)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Product Form */}
        <div className="add-product">
          <h2>{editId ? "Edit Product" : "Add Product"}</h2>
          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input
              type="text"
              value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })}
            />
            <label>Category</label>
            <input
              type="text"
              value={form.Category}
              onChange={(e) => setForm({ ...form, Category: e.target.value })}
            />
            <label>Stock</label>
            <input
              type="number"
              value={form.Stock}
              onChange={(e) =>
                setForm({ ...form, Stock: Number(e.target.value) })
              }
            />
            <label>Price</label>
            <input
              type="number"
              value={form.Price}
              onChange={(e) =>
                setForm({ ...form, Price: Number(e.target.value) })
              }
            />
            <button type="submit" className="add-btn">
              {editId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setForm({ Name: "", Category: "", Stock: "", Price: "" });
                setEditId(null);
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
