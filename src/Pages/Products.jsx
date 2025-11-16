import { useState } from "react";
import "../assets/styles/Products.css";

export default function Products() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Nike Air Max",
      category: "Category A",
      stock: 12,
      price: 2499,
    },
    {
      id: 2,
      name: "Spalding Basketball",
      category: "Category A",
      stock: 30,
      price: 999,
    },
    {
      id: 3,
      name: "Yonex Shuttlecock",
      category: "Category B",
      stock: 40,
      price: 799,
    },
    {
      id: 4,
      name: "Adidas Jersey",
      category: "Category C",
      stock: 20,
      price: 1499,
    },
    {
      id: 5,
      name: "Gym Gloves",
      category: "Category D",
      stock: 15,
      price: 499,
    },
    {
      id: 6,
      name: "Resistance Band Set",
      category: "Category E",
      stock: 25,
      price: 899,
    },
  ]);

  const [categories, setCategories] = useState([
    "All",
    "Category A",
    "Category B",
    "Category C",
    "Category D",
    "Category E",
  ]);

  const [showCatTable, setShowCatTable] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editCatIndex, setEditCatIndex] = useState(null);
  const [editCatName, setEditCatName] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  /* SORT STATES */
  const [showSort, setShowSort] = useState(false);
  const [sortOption, setSortOption] = useState("");

  /* SUBMIT HANDLER */
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

  /* DELETE PRODUCT */
  const handleDelete = (id) => {
    if (!window.confirm("Delete this product?")) return;
    setProducts(products.filter((p) => p.id !== id));
  };

  /* EDIT PRODUCT */
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
    });
    setEditId(product.id);
  };

  /* FILTER */
  let filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "All" || p.category === activeCategory;

    return matchSearch && matchCategory;
  });

  /* SORTING */
  if (sortOption === "stock-asc")
    filteredProducts.sort((a, b) => a.stock - b.stock);
  if (sortOption === "stock-desc")
    filteredProducts.sort((a, b) => b.stock - a.stock);
  if (sortOption === "price-asc")
    filteredProducts.sort((a, b) => a.price - b.price);
  if (sortOption === "price-desc")
    filteredProducts.sort((a, b) => b.price - a.price);

  return (
    <div className="dashboard">
      <h1 className="page-title">Products</h1>

      {/* TOP CONTROLS */}
      <div className="top-controls">
        <button
          className="category-manage-btn"
          onClick={() => setShowCatTable((prev) => !prev)}
        >
          Manage Categories
        </button>

        <input
          type="text"
          placeholder="Search items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="sort-container">
          <button
            className="sort-btn"
            onClick={() => setShowSort((prev) => !prev)}
          >
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

      {/* CATEGORY POPUP */}
      {showCatTable && (
        <div className="category-popup">
          <h3>Manage Categories</h3>

          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((cat, index) =>
                cat !== "All" ? (
                  <tr key={index}>
                    <td>
                      {editCatIndex === index ? (
                        <input
                          type="text"
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                        />
                      ) : (
                        cat
                      )}
                    </td>

                    <td>
                      {editCatIndex === index ? (
                        <button
                          className="save-btn"
                          onClick={() => {
                            const updated = [...categories];
                            updated[index] = editCatName;
                            setCategories(updated);
                            setEditCatIndex(null);
                          }}
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditCatIndex(index);
                            setEditCatName(cat);
                          }}
                        >
                          Edit
                        </button>
                      )}

                      <button
                        className="delete-btn"
                        onClick={() =>
                          setCategories(
                            categories.filter((_, i) => i !== index)
                          )
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>

          <div className="add-cat-row">
            <input
              type="text"
              placeholder="New Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button
              className="add-btn"
              onClick={() => {
                if (!newCategory.trim()) return;
                setCategories([...categories, newCategory]);
                setNewCategory("");
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* CATEGORY TABS */}
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
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.stock}</td>
                  <td>₱{p.price}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(p)}>
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
              ))}
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
