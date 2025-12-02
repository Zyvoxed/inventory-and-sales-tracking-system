import React, { useState } from "react";
import "../assets/styles/Topbar.css";

export default function Topbar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login"; // redirect to your login page
  };

  return (
    <header className="topbar">
      <h1 className="company-name">Storix</h1>

      <div className="user">
        <img
          src="https://i.imgflip.com/893yt7.png"
          alt="User"
          className="avatar"
        />

        {/* INFO SECTION */}
        <div className="info">
          <span className="name">{user?.fullname || "User"}</span>
          <span className="role">{user?.role || "Unknown"}</span>
        </div>

        {/* DROPDOWN ARROW IN BOX */}
        <div
          className="arrow-container"
          onClick={() => setOpen(!open)}
        >
          <span className={`user-arrow ${open ? "open" : ""}`}></span>
        </div>

        {/* DROPDOWN MENU (always in DOM) */}
        <div className={`user-dropdown ${open ? "open" : ""}`}>
          <ul>
            <li onClick={handleLogout}>Logout</li>
          </ul>
        </div>
      </div>


    </header>
  );
}
