import { useState, useEffect } from "react";
import axios from "axios";
import "../assets/styles/Cashier.css";

export default function Cashier() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // State for products
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // State for cart
  const [cart, setCart] = useState([]);
  const [moneyReceived, setMoneyReceived] = useState(0);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    axios
      .get("http://localhost:8081/product")
      .then((res) => setProducts(res.data))
      .catch(() => alert("Error loading products"));
  };

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to cart
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.ID === product.ID);
    const availableStock = Number(product.Stock || 0);

    if (existingItem) {
      // If product already in cart, increase quantity but not beyond stock
      if (existingItem.cartQuantity + 1 > availableStock) {
        alert("Cannot add more. Insufficient stock.");
        return;
      }

      setCart(
        cart.map((item) =>
          item.ID === product.ID
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        )
      );
    } else {
      if (availableStock <= 0) {
        alert("Product out of stock");
        return;
      }
      // Add new product to cart with quantity 1
      setCart([...cart, { ...product, cartQuantity: 1 }]);
    }
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    const updatedCart = cart
      .map((item) =>
        item.ID === productId
          ? { ...item, cartQuantity: item.cartQuantity - 1 }
          : item
      )
      .filter((item) => item.cartQuantity > 0);

    setCart(updatedCart);
  };

  // Calculate totals
  const total = cart.reduce(
    (sum, item) => sum + Number(item.Price || 0) * Number(item.cartQuantity || 0),
    0
  );
  const change = moneyReceived - total;

  // Complete sale
  const completeSale = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (moneyReceived < total) {
      alert("Insufficient payment!");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user.user_id) {
      alert("User not logged in!");
      return;
    }

    // Prepare sale data
    const saleData = {
      user_id: user.user_id,
      items: cart.map((item) => ({
        product_id: item.ID,
        quantity: Number(item.cartQuantity || 0),
        subtotal: Number(item.Price || 0) * Number(item.cartQuantity || 0),
      })),
    };

    // Send to backend
    axios
      .post("http://localhost:8081/sale", saleData)
      .then(() => {
        alert(
          `Sale completed!\nTotal: ₱${total.toFixed(2)}\nChange: ₱${change.toFixed(2)}`
        );
        // Reset cart and payment
        setCart([]);
        setMoneyReceived(0);
        loadProducts(); // Refresh products to update stock
      })
      .catch((err) => {
        console.error("Sale error:", err);
        alert("Error completing sale");
      });
  };

  return (
     <div className="cashier-container">
        <div className="cashier-main">
          {/* LEFT SECTION: PRODUCTS */}
          <div className="cashier-products-section">
            <h1 className="page-title">Cashier Point of Sale</h1>

            {/* Search Bar */}
            <div className="cashier-search">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Products Grid */}
            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div key={product.ID} className="product-card">
                    <div className="product-info">
                      <h3>{product.Name}</h3>
                      <p className="product-price">₱{product.Price}</p>
                      <p className="product-stock">
                        {(() => {
                          const totalStock = Number(product.Stock || 0);
                          const inCart = cart.find((c) => c.ID === product.ID);
                          const cartQty = Number(inCart?.cartQuantity || 0);
                          const remaining = Math.max(0, totalStock - cartQty);
                          return `Stock: ${remaining}`;
                        })()}
                      </p>
                    </div>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                      disabled={
                        Number(product.Stock || 0) === 0 ||
                        (cart.find((c) => c.ID === product.ID) &&
                          Number(cart.find((c) => c.ID === product.ID).cartQuantity) >=
                            Number(product.Stock || 0))
                      }
                    >
                      Add to Cart
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-products">No products found</p>
              )}
            </div>
          </div>

          {/* RIGHT SECTION: CART & PAYMENT */}
          <div className="cashier-cart-section">
            <h2>Shopping Cart</h2>

            {/* Cart Items */}
            <div className="cart-items">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.ID} className="cart-item">
                    <div className="cart-item-info">
                      <p className="cart-item-name">{item.Name}</p>
                      <p className="cart-item-price">
                        ₱{item.Price} x {item.cartQuantity}
                      </p>
                    </div>
                    <div className="cart-item-actions">
                      <button
                        className="minus-btn"
                        onClick={() => removeFromCart(item.ID)}
                      >
                        −
                      </button>
                      <span className="qty-display">{item.cartQuantity}</span>
                      <button
                        className="plus-btn"
                        onClick={() => addToCart(item)}
                        disabled={Number(item.cartQuantity || 0) >= Number(item.Stock || 0)}
                      >
                        +
                      </button>
                    </div>
                    <p className="cart-item-subtotal">
                      ₱{(Number(item.Price || 0) * Number(item.cartQuantity || 0)).toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="empty-cart">Cart is empty</p>
              )}
            </div>

            {/* Payment Section */}
            <div className="payment-section">
              <div className="payment-row">
                <label>Total:</label>
                <p className="payment-value">₱{total.toFixed(2)}</p>
              </div>

              <div className="payment-row">
                <label>Money Received:</label>
                <input
                  type="number"
                  value={moneyReceived}
                  onChange={(e) => setMoneyReceived(parseFloat(e.target.value) || 0)}
                  placeholder="Enter amount"
                  className="money-input"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="payment-row change-row">
                <label>Change:</label>
                <p
                  className={`payment-value ${
                    change < 0 ? "insufficient" : "change"
                  }`}
                >
                  ₱{change.toFixed(2)}
                </p>
              </div>

              <button
                className="complete-sale-btn"
                onClick={completeSale}
                disabled={cart.length === 0 || moneyReceived < total}
              >
                Complete Sale
              </button>

              <button
                className="clear-cart-btn"
                onClick={() => {
                  setCart([]);
                  setMoneyReceived(0);
                }}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
