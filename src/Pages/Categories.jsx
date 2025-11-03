import { useState } from "react";

export default function Categories() {
  const [categories, setCategories] = useState([
    "Clothing",
    "Footwear",
    "Accessories",
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // Add or update category
  const addCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    if (editIndex !== null) {
      const confirmUpdate = window.confirm(
        "Are you sure you want to update this category?"
      );
      if (!confirmUpdate) return;

      setCategories((prev) =>
        prev.map((cat, idx) => (idx === editIndex ? newCategory.trim() : cat))
      );
      setEditIndex(null);
    } else {
      const confirmAdd = window.confirm(
        "Are you sure you want to add this category?"
      );
      if (!confirmAdd) return;

      setCategories([...categories, newCategory.trim()]);
    }

    setNewCategory("");
  };

  // Delete category
  const handleDelete = (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmDelete) return;

    setCategories(categories.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
      setNewCategory("");
    }
  };

  // Edit category
  const handleEdit = (index) => {
    const confirmEdit = window.confirm("Do you want to edit this category?");
    if (!confirmEdit) return;

    setNewCategory(categories[index]);
    setEditIndex(index);
  };

  return (
    <div className="dashboard">
      <h1>Categories</h1>

      <div className="card">
        <h2>{editIndex !== null ? "Edit Category" : "Add Category"}</h2>
        <form onSubmit={addCategory}>
          <input
            type="text"
            placeholder="Category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button type="submit">{editIndex !== null ? "Update" : "Add"}</button>
        </form>
      </div>

      <div className="card">
        <h2>Existing Categories</h2>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {categories.map((c, i) => (
            <li
              key={i}
              style={{
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{c}</span>
              <div>
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
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
