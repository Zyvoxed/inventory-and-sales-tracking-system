import "../assets/styles/Login.css";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
    navigate("/dashboard");
  };

  const [toggled, setToggled] = useState(false); // actual role state
  const [isFading, setIsFading] = useState(false); // controls fade-out / fade-in

  const handleToggle = () => {
    if (isFading) return; // prevent double clicks while animating
    setIsFading(true);

    // Wait for fade-out to finish, then flip the role and fade back in
    // (match this duration to the CSS -- here it's 200ms)
    setTimeout(() => {
      setToggled((prev) => !prev);
      setIsFading(false);
    }, 200);
  };

  const title = toggled ? "Cashier Login" : "Admin Login";

  return (
    <div className="admin-login-container">
      {/* RIGHT SIDE – INTRO SECTION */}
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

      {/* LEFT SIDE – LOGIN FORM */}
      <div className="admin-login-form">
        <div className="admin-form-content">
          <form onSubmit={handleSubmit}>
            {/* controlled fade-out -> swap -> fade-in */}
            <h2 className={`fade-label ${isFading ? "fade-out" : ""}`}>
              {title}
            </h2>

            <input type="email" name="email" placeholder="Email" required />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />

            <button type="submit">Login</button>
          </form>

          {/* Toggle button stays with fade animation */}
          <p
            className={`toggle-button fade-label ${isFading ? "fade-out" : ""}`}
            onClick={handleToggle}
          >
            {toggled ? "Admin Login" : "Cashier Login"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
