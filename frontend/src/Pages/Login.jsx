// src/Pages/Login.jsx
import "../assets/styles/Login.css";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [toggled, setToggled] = useState(false); // false = Admin, true = Cashier
  const [isFading, setIsFading] = useState(false);

  const handleToggle = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      setToggled((prev) => !prev);
      setIsFading(false);
    }, 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;
    const role = toggled ? "Cashier" : "Admin";

    fetch("http://localhost:8081/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Login failed");
        return body;
      })
      .then((data) => {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role === "Admin") navigate("/dashboard");
        else if (data.user.role === "Cashier") navigate("/cashier");
      })
      .catch((err) => {
        alert(err.message || "Error logging in");
      });
  };

  const title = toggled ? "Cashier Login" : "Admin Login";

  return (
    <div className="admin-login-container">
      <div className="admin-intro-text">
        <div className="admin-text-content">
          <h1>Web-Based Inventory and Sales Tracking System</h1>
          <p>
            This system provides role-based access, product management, stock
            updates, and reports to improve business efficiency.
          </p>
          <img
            src="src/assets/images/box.png"
            alt="Box Icon"
            className="admin-box-icon"
          />
        </div>
      </div>

      <div className="admin-login-form">
        <div className="admin-form-content">
          <form onSubmit={handleSubmit}>
            <h2 className={`fade-label ${isFading ? "fade-out" : ""}`}>
              {title}
            </h2>

            <input type="text" name="username" placeholder="Username" required />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />

            <button type="submit">Login</button>
          </form>

          <p
            className={`toggle-button fade-label ${
              isFading ? "fade-out" : ""
            }`}
            onClick={handleToggle}
            style={{ cursor: "pointer" }}
          >
            {toggled ? "Admin Login" : "Cashier Login"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
