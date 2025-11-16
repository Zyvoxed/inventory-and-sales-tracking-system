import "../assets/styles/Login.css";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

function EmployeeLogin({ onLogin }) {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login form submitted");
    onLogin();
    navigate("/dashboard");
  };

  const [toggled, setToggled] = useState(false);
  const handleToggle = () => {
    setToggled(!toggled);
  };

  return (
    <div className="admin-login-container">
      <div className={`admin-intro-text ${toggled ? "box-right" : "box-left"}`}>
        <h1 className="admin-company-title">Storix</h1>
        <img
          src="src/assets/images/storix.png"
          alt="Box Icon"
          className="admin-company-icon"
        />
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

      <div
        className={`admin-login-form ${toggled ? "form-right" : "form-left"}`}
      >
        <div className="admin-form-content">
          <form onSubmit={handleSubmit}>
            <h2>{toggled ? "Cashier Login" : "Admin Login"}</h2>
            <input type="email" name="email" placeholder="Email" required />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <button type="submit">Login</button>
          </form>

          <p className="toggle-button" onClick={handleToggle}>
            {toggled ? "Admin Login" : "Cashier Login"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmployeeLogin;
