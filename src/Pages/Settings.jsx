import React, { useState } from "react";
import { useTheme } from "../Context/ThemeContext";
import "../assets/styles/Settings.css";

export default function Settings() {
  const [name, setName] = useState("Reiner Da Slayer");
  const { theme, setTheme, toggleTheme } = useTheme();

  const handleSave = (e) => {
    e.preventDefault();
    alert(`Settings Saved!\nName: ${name}\nTheme: ${theme}`);
  };

  return (
    <div className="dashboard">
      <h1 className="page-title">Manage Accounts</h1>
      <div className="settings-card">
        <h2>Profile Settings</h2>
        <form onSubmit={handleSave} className="settings-form">
          <label>Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value.toLowerCase())}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>

          <button type="button" onClick={toggleTheme}>
            Toggle Theme
          </button>
          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
