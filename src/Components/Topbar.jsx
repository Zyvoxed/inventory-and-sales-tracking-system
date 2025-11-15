import React from "react";
import "../assets/styles/Topbar.css";

export default function Topbar() {
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
          <span className="name">Frieren Da Slayer</span>
          <span className="role">Admin</span>
        </div>
      </div>
    </header>
  );
}