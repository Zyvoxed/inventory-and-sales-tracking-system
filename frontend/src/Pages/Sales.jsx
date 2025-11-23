import { useState, useEffect } from "react";
import axios from "axios";
import "../assets/styles/Sales.css";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState(1);

  // Load products and sales
  useEffect(() => {
    axios
      .get("http://localhost:8081/product")
      .then((res) => setProducts(res.data))
      .catch(() => alert("Error loading products"));

    loadSales();
  }, []);

  const loadSales = () => {
    axios
      .get("http://localhost:8081/sales")
      .then((res) => setSalesList(res.data))
      .catch(() => alert("Error loading sales"));
  };

  const addToCart = () => {
    if (!selectedProduct || qty <= 0) return;

    const product = products.find((p) => p.ID == selectedProduct);
    if (!product) return;

    const subtotal = qty * product.Price;

    setCart([
      ...cart,
      { product_id: product.ID, name: product.Name, quantity: qty, subtotal },
    ]);
    setSelectedProduct("");
    setQty(1);
  };

  const totalCart = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const saveSale = () => {
    if (cart.length === 0) return alert("Cart is empty");

    axios
      .post("http://localhost:8081/sale", { user_id: 1, items: cart })
      .then(() => {
        alert("Sale saved!");
        setCart([]);
        loadSales();
      })
      .catch((err) => {
        console.error(err);
        alert("Error saving sale. Check backend terminal.");
      });
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

  return (
    <div className="dashboard">
      <h1 className="page-title">Sales Report</h1>

      {/* ADD SALE */}
      <div className="add-sale-box">
        <h3>Add Sale</h3>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.ID} value={p.ID}>
              {p.Name} (₱{p.Price})
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
        />
        <button onClick={addToCart}>Add</button>
      </div>

      {/* CART */}
      <table className="sales-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>₱{item.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Total: ₱{totalCart}</h2>
      <button onClick={saveSale} className="save-btn">
        Save Sale
      </button>

      {/* SALES HISTORY */}
      <h2 className="page-title">Sales History</h2>
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
    </div>
  );
}
