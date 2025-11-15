import { useState } from "react";
import "../assets/styles/Products.css";

export default function Products() {
  const [products, setProducts] = useState([
    { id: 1, name: "T-Shirt", category: "Clothing", stock: 50, price: 199 },
    { id: 2, name: "Sneakers", category: "Footwear", stock: 25, price: 799 },
  ]);

  const [form, setForm] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  // Add or Update
  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.name.trim() === "" || form.stock === "" || form.price === "") {
      window.alert("Please fill out all required fields.");
      return;
    }

    if (editId) {
      if (!window.confirm("Update this product?")) return;

      setProducts((prev) =>
        prev.map((p) => (p.id === editId ? { ...form, id: editId } : p))
      );

      setEditId(null);
    } else {
      setProducts([
        ...products,
        {
          ...form,
          id: Date.now(),
          stock: Number(form.stock),
          price: Number(form.price),
        },
      ]);
    }

    setForm({ name: "", category: "", stock: "", price: "" });
  };

  // Delete
  const handleDelete = (id) => {
    if (!window.confirm("Delete this product?")) return;
    setProducts(products.filter((p) => p.id !== id));
  };

  // Edit
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
    });
    setEditId(product.id);
  };

  // Search Filter
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      {/* PAGE TITLE */}
      <h1 className="page-title">Products</h1>

      {/* SEARCH + SORT */}
      <div className="top-controls">
        <input
          type="text"
          placeholder="Search items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="sort-btn">⇅ Sort By</button>
      </div>

      {/* CATEGORY TABS */}
      <div className="category-tabs">
        <button className="active">Sports Shoes</button>
        <button>Balls & Shuttlecocks</button>
        <button>Apparel & Accessories</button>
        <button>Equipment & Gear</button>
        <button>Training & Fitness Tools</button>
      </div>

      {/* CONTENT GRID */}
      <div className="content-grid">
        {/* PRODUCT TABLE */}
        <div className="product-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.stock}</td>
                    <td>₱{p.price}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ADD PRODUCT FORM */}
        <div className="add-product">
          <h2>{editId ? "Edit Product" : "Add Product"}</h2>

          <form onSubmit={handleSubmit}>

            <label>Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label>Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <label>Stock</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: Number(e.target.value) })
              }
            />

            <label>Price</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
            />

            <button type="submit" className="add-btn">
              {editId ? "Update" : "Add"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setForm({ name: "", category: "", stock: "", price: "" });
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
