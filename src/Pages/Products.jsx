import { useState } from "react";

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

  // Add or update product
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.category) return;

    if (editId) {
      const confirmUpdate = window.confirm(
        "Are you sure you want to update this product?"
      );
      if (!confirmUpdate) return;

      setProducts((prev) =>
        prev.map((product) =>
          product.id === editId ? { ...form, id: editId } : product
        )
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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    setProducts(products.filter((product) => product.id !== id));
    if (editId === id) {
      setEditId(null);
      setForm({ name: "", category: "", stock: "", price: "" });
    }
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

  return (
    <div className="dashboard">
      <h1>Products</h1>

      <div className="card add-product-card">
        <h2>{editId ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <button type="submit">{editId ? "Update" : "Add"}</button>
        </form>
      </div>

      <div className="card product-table">
        <h2>Product List</h2>
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
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.stock}</td>
                <td>₱{p.price}</td>
                <td>
                  <button
                    onClick={() => handleEdit(p)}
                    style={{
                      backgroundColor: "#9bb8e7ff",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      marginRight: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{
                      backgroundColor: "#ec9494ff",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
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
      </div>
    </div>
  );
}
