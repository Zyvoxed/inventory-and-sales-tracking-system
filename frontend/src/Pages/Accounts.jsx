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
  const [accountBin, setAccountBin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("account_bin")) || [];
    } catch {
      return [];
    }
  });
  const [showBin, setShowBin] = useState(false);

  const currentUserId = Number(localStorage.getItem("currentUserId"));

  const loadAccounts = () => {
    fetch("http://localhost:8081/users")
      .then((res) => res.json())
      .then((data) => {
        const binIds = accountBin.map((a) => a.user_id);
        setAccounts(data.filter((u) => !binIds.includes(u.user_id)));
      })
      .catch((err) => console.error("Error loading users:", err));
  };

  useEffect(() => loadAccounts(), []);
  useEffect(() => {
    localStorage.setItem("account_bin", JSON.stringify(accountBin));
    loadAccounts();
  }, [accountBin]);

  const loadAuditLogs = (userId) => {
    fetch(`http://localhost:8081/users/audit/${userId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAuditLogs((prev) => ({ ...prev, [userId]: data })))
      .catch(() => setAuditLogs((prev) => ({ ...prev, [userId]: [] })));
  };

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else {
      setExpandedId(id);
      loadAuditLogs(id);
    }
  };

  const createUser = (e) => {
    e.preventDefault();
    if (!currentUserId) return alert("No logged-in user detected.");

    fetch("http://localhost:8081/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, userId: currentUserId }),
    })
      .then((res) => res.json())
      .then((msg) => {
        alert(msg.success || msg.error || "Response received");
        setForm({ username: "", password: "", fullname: "", role: "Cashier" });
        loadAccounts();
      })
      .catch(() => alert("Error creating user"));
  };

  const moveToBin = (acc) => {
    const visibleAdmins = accounts.filter((a) => a.role === "Admin");
    if (acc.role === "Admin" && visibleAdmins.length <= 1)
      return alert("Cannot remove the last admin.");

    setAccountBin((prev) =>
      prev.some((p) => p.user_id === acc.user_id) ? prev : [...prev, acc]
    );
    setAccounts((prev) => prev.filter((a) => a.user_id !== acc.user_id));
    if (expandedId === acc.user_id) setExpandedId(null);
  };

  const retrieveFromBin = (acc) => {
    setAccountBin((prev) => prev.filter((a) => a.user_id !== acc.user_id));
    setAccounts((prev) => [acc, ...prev]);
  };

  return (
    <div className="dashboard">
      <h1 className="page-title">Manage User Accounts</h1>

      {/* Create Account Form */}
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

      {/* Bin Toggle and Refresh */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 18,
        }}
      >
        <h2>Existing Accounts</h2>
        <div>
          <button
            className="category-manage-btn"
            onClick={() => setShowBin((s) => !s)}
          >
            {showBin
              ? `Hide Account Bin (${accountBin.length})`
              : `Show Account Bin (${accountBin.length})`}
          </button>
          <button
            style={{ marginLeft: 10 }}
            className="category-manage-btn"
            onClick={loadAccounts}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Accounts List */}
      <div style={{ marginTop: 12 }}>
        {accounts.length === 0 && <p>No accounts found.</p>}
        {accounts.map((acc) => (
          <div key={acc.user_id} className="account-box account-expand">
            <div className="account-header">
              <div>
                <div className="account-fullname">
                  <span className="account-name">{acc.fullname}</span>
                </div>
                <div
                  className="account-meta-container"
                  style={{ marginTop: 8 }}
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
                  onClick={() =>
                    window.confirm(`Move ${acc.fullname} to Account Bin?`) &&
                    moveToBin(acc)
                  }
                  title="Move to Bin"
                >
                  −
                </button>
                <button
                  className="expand-btn black-btn"
                  onClick={() => toggleExpand(acc.user_id)}
                >
                  {expandedId === acc.user_id
                    ? "Hide Logs ▲"
                    : "View Audit Logs ▼"}
                </button>
              </div>
            </div>

            {/* Audit Logs */}
            {expandedId === acc.user_id && (
              <div className="audit-log-box adaptive-box">
                <h3>Audit History</h3>
                {auditLogs[acc.user_id] === undefined ? (
                  <p>Loading...</p>
                ) : auditLogs[acc.user_id].length > 0 ? (
                  auditLogs[acc.user_id].map((log, idx) => (
                    <div key={log.log_id || idx} className="audit-item">
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

      {/* Account Bin */}
      {showBin && (
        <div style={{ marginTop: 24 }}>
          <h2>Account Bin</h2>
          <div className="add-account-box" style={{ padding: 12 }}>
            {accountBin.length === 0 && <p>Bin is empty.</p>}
            {accountBin.map((b) => (
              <div
                key={b.user_id}
                className="account-box"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{b.fullname}</div>
                  <div style={{ marginTop: 6 }}>
                    <small>
                      Username: <strong>{b.username}</strong>
                    </small>
                    <br />
                    <small>
                      Role: <strong>{b.role}</strong>
                    </small>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="add-btn"
                    onClick={() =>
                      window.confirm(`Retrieve ${b.fullname} from Bin?`) &&
                      retrieveFromBin(b)
                    }
                  >
                    Retrieve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
