import { useState, useEffect } from "react";
import axios from "axios";
import "../assets/styles/Cashier.css";

export default function Cashier() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = Number(localStorage.getItem("currentUserId"));

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [moneyReceived, setMoneyReceived] = useState(0);
  const [incidentDesc, setIncidentDesc] = useState("");
  const [sendingIncident, setSendingIncident] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);
  const loadProducts = () => {
    axios
      .get("http://localhost:8081/product")
      .then((res) => setProducts(res.data))
      .catch(() => alert("Error loading products"));
  };

  const filteredProducts = products.filter((p) =>
    p.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find((c) => c.ID === product.ID);
    const stock = Number(product.Stock || 0);
    if (existing) {
      if (existing.cartQuantity + 1 > stock) {
        alert("Insufficient stock");
        return;
      }
      setCart(
        cart.map((c) =>
          c.ID === product.ID ? { ...c, cartQuantity: c.cartQuantity + 1 } : c
        )
      );
    } else if (stock > 0) {
      setCart([...cart, { ...product, cartQuantity: 1 }]);
    } else alert("Product out of stock");
  };

  const removeFromCart = (id) =>
    setCart(
      cart
        .map((c) =>
          c.ID === id ? { ...c, cartQuantity: c.cartQuantity - 1 } : c
        )
        .filter((c) => c.cartQuantity > 0)
    );

  const total = cart.reduce(
    (sum, i) => sum + Number(i.Price) * Number(i.cartQuantity),
    0
  );
  const change = moneyReceived - total;

  const completeSale = () => {
    if (!cart.length) return alert("Cart empty");
    if (moneyReceived < total) return alert("Insufficient payment");
    if (!currentUserId) return alert("User not logged in");

    const saleData = {
      user_id: currentUserId,
      items: cart.map((i) => ({
        product_id: i.ID,
        quantity: i.cartQuantity,
        subtotal: i.Price * i.cartQuantity,
      })),
    };

    // Send pending sale to backend (do not decrement stock yet)
    axios
      .post("http://localhost:8081/pending-sales", saleData)
      .then(() => {
        alert(
          `Transaction saved to pending sales.\nTotal: ₱${total.toFixed(2)}\nChange: ₱${change.toFixed(2)}`
        );
        // Reset cart and payment but DO NOT refresh product stock yet
        setCart([]);
        setMoneyReceived(0);
      })
      .catch((err) => {
        console.error("Pending sale error:", err);
        alert("Error saving transaction");
      });
  };

  const sendIncident = async () => {
    if (!incidentDesc.trim()) return alert("Describe the incident");
    if (!currentUserId) return alert("User not logged in");
    setSendingIncident(true);

    try {
      await axios.post("http://localhost:8081/incident-report", {
        reportedby_id: currentUserId,
        description: incidentDesc.trim(),
        status: "Pending",
        created_at: new Date().toISOString(),
      });
      alert("Incident report sent");
      setIncidentDesc("");
    } catch (err) {
      console.error(err);
      alert("Failed to send incident");
    } finally {
      setSendingIncident(false);
    }
  };

  return (
    <div className="cashier-container">
      {/* Products Section */}
      <div className="cashier-products-section">
        <h1>Cashier POS</h1>
        <input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="products-grid">
          {filteredProducts.map((p) => {
            const cartQty = cart.find((c) => c.ID === p.ID)?.cartQuantity || 0;
            const remaining = Math.max(0, Number(p.Stock) - cartQty);
            return (
              <div key={p.ID} className="product-card">
                <h3>{p.Name}</h3>
                <p>₱{p.Price}</p>
                <p>Stock: {remaining}</p>
                <button onClick={() => addToCart(p)} disabled={remaining <= 0}>
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Section */}
      <div className="cashier-cart-section">
        <h2>Shopping Cart</h2>
        {cart.map((i) => (
          <div key={i.ID} className="cart-item">
            <p>
              {i.Name} x {i.cartQuantity} = ₱
              {(i.Price * i.cartQuantity).toFixed(2)}
            </p>
            <button onClick={() => removeFromCart(i.ID)}>−</button>
            <button onClick={() => addToCart(i)}>+</button>
          </div>
        ))}
        <p>Total: ₱{total.toFixed(2)}</p>
        <input
          type="number"
          placeholder="Money received"
          value={moneyReceived}
          onChange={(e) => setMoneyReceived(Number(e.target.value) || 0)}
        />
        <p>Change: ₱{change.toFixed(2)}</p>
        <button onClick={completeSale}>Complete Sale</button>
        <button
          onClick={() => {
            setCart([]);
            setMoneyReceived(0);
          }}
        >
          Clear Cart
        </button>

        <h3>Report an Incident</h3>
        <textarea
          value={incidentDesc}
          onChange={(e) => setIncidentDesc(e.target.value)}
          rows={4}
        />
        <button onClick={sendIncident} disabled={sendingIncident}>
          {sendingIncident ? "Sending..." : "Send Report"}
        </button>
      </div>
    </div>
  );
}
