import React from "react";
import "../assets/styles/Topbar.css";

export default function Topbar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <header className="topbar">
      <h1 className="company-name">Storix</h1>

      <div className="user">
        <img
          src="https://i.imgflip.com/893yt7.png"
          alt="User"
          className="avatar"
        />
        <div className="info">
          <span className="name">{user?.fullname || "User"}</span>
          <span className="role">{user?.role || "Unknown"}</span>
        </div>
      </div>
    </header>
  );
}
