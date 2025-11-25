// src/Pages/Accounts.jsx
import React, { useState, useEffect } from "react";
import "../assets/styles/Accounts.css";

export default function ManageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullname: "",
    role: "Cashier",
  });
  const [auditLogs, setAuditLogs] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  const loadAccounts = () => {
    fetch("http://localhost:8081/users")
      .then((res) => res.json())
      .then((data) => setAccounts(data))
      .catch((err) => console.error("Error loading users:", err));
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAuditLogs = (userId) => {
    fetch(`http://localhost:8081/audit/${userId}`)
      .then((res) => res.json())
      .then((data) =>
        setAuditLogs((prev) => ({
          ...prev,
          [userId]: data,
        }))
      )
      .catch(() => {
        setAuditLogs((prev) => ({ ...prev, [userId]: [] }));
      });
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      loadAuditLogs(id);
    }
  };

  const createUser = (e) => {
    e.preventDefault();

    fetch("http://localhost:8081/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((msg) => {
        alert(msg.success || msg.error);
        setForm({ username: "", password: "", fullname: "", role: "Cashier" });
        loadAccounts();
      })
      .catch(() => alert("Error creating user"));
  };

  const removeAccount = (id) => {
    if (!window.confirm("Delete this account?")) return;

    fetch(`http://localhost:8081/users/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((msg) => {
        alert(msg.success || msg.error);
        loadAccounts();
      })
      .catch(() => alert("Error deleting user"));
  };

  return (
    <div className="dashboard">
      <h1 className="page-title">Manage User Accounts</h1>

      {/* Add Account */}
      <div className="add-account-box">
        <h2>Create New Account</h2>

        <form onSubmit={createUser} className="create-account-form">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Full Name"
            value={form.fullname}
            onChange={(e) => setForm({ ...form, fullname: e.target.value })}
            required
          />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="Cashier">Cashier</option>
            <option value="Admin">Admin</option>
          </select>

          <button type="submit" className="add-btn">
            Create Account
          </button>
        </form>
      </div>

      {/* Existing Accounts */}
      <h2 style={{ marginTop: "20px" }}>Existing Accounts</h2>

      {accounts.length === 0 && <p>No accounts found.</p>}

      {accounts.map((acc) => (
        <div key={acc.user_id} className="account-box account-expand">
          <div className="account-header">
            <div>
              {/* Fullname stays at the top */}
              <div className="account-fullname">
                <span className="account-name">{acc.fullname}</span>
              </div>

              {/* Push username and role slightly lower */}
              <div
                className="account-meta-container"
                style={{ marginTop: "8px" }} // adjust this value to increase/decrease spacing
              >
                <span className="account-meta">
                  Username: <strong>{acc.username}</strong>
                </span>
                <br />
                <span className="account-meta">
                  Role: <strong>{acc.role}</strong>
                </span>
              </div>
            </div>

            <div>
              <button
                className="icon-btn delete-btn"
                onClick={() => removeAccount(acc.user_id)}
                title="Delete"
              >
                −
              </button>

              <button
                className="expand-btn black-btn"
                onClick={() => toggleExpand(acc.user_id)}
              >
                {expandedId === acc.user_id ? "Hide Logs ▲" : "View Audit Logs ▼"}
              </button>
            </div>
          </div>

          {/* AUDIT LOG DROPDOWN */}
          {expandedId === acc.user_id && (
            <div className="audit-log-box adaptive-box">
              <h3>Audit History</h3>

              {auditLogs[acc.user_id] === undefined ? (
                <p>Loading...</p>
              ) : auditLogs[acc.user_id].length > 0 ? (
                auditLogs[acc.user_id].map((log) => (
                  <div key={log.log_id} className="audit-item">
                    <p>
                      <strong>Action:</strong> {log.action}
                    </p>
                    <p>
                      <strong>Description:</strong> {log.description}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : "-"}
                    </p>
                    <hr />
                  </div>
                ))
              ) : (
                <p>No audit logs found.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
