import React from "react";
import "../assets/styles/Topbar.css";

export default function Topbar() {
  return (
    <header className="topbar">
      <input className="search" type="text" placeholder="Search products" />

      <div className="user">
        <img
          src="https://i.imgflip.com/893yt7.png"
          alt="User"
          className="avatar"
        />
        <div className="info">
          <span className="name">Frieren Da Slayer</span>
          <span className="role">lazy elf</span>
        </div>
      </div>
    </header>
  );
}
