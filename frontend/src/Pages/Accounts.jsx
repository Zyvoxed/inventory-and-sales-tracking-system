// src/Pages/Accounts.jsx
import React, { useState, useEffect } from "react";
import "../assets/styles/Accounts.css";

/**
 * Accounts.jsx
 *
 * Behavior added:
 * - Account Bin (frontend-only, persisted to localStorage at key 'account_bin')
 * - "Fake delete" moves account to bin (no DB deletion)
 * - Retrieve restores account from bin to visible accounts (still in DB)
 * - Prevent deleting the last Admin (counts only visible accounts)
 * - Audit logs still fetched from backend via /audit/:user_id
 */

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

  // Account Bin (frontend-only storage)
  const [accountBin, setAccountBin] = useState(() => {
    try {
      const raw = localStorage.getItem("account_bin");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // UI state for toggling Bin view
  const [showBin, setShowBin] = useState(false);

  // Load accounts from backend but FILTER OUT accounts currently in Bin
  const loadAccounts = () => {
    fetch("http://localhost:8081/users")
      .then((res) => res.json())
      .then((data) => {
        // Filter out accounts that are in the frontend bin
        const binIds = accountBin.map((a) => a.user_id);
        const visible = data.filter((u) => !binIds.includes(u.user_id));
        setAccounts(visible);
      })
      .catch((err) => console.error("Error loading users:", err));
  };

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist accountBin to localStorage any time it changes and reload visible accounts
  useEffect(() => {
    try {
      localStorage.setItem("account_bin", JSON.stringify(accountBin));
    } catch (err) {
      console.error("Could not save account bin:", err);
    }
    // After updating bin, refresh visible accounts from server and filter
    fetch("http://localhost:8081/users")
      .then((res) => res.json())
      .then((data) => {
        const binIds = accountBin.map((a) => a.user_id);
        const visible = data.filter((u) => !binIds.includes(u.user_id));
        setAccounts(visible);
      })
      .catch((err) => console.error("Error loading users:", err));
  }, [accountBin]);

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
        alert(msg.success || msg.error || "Response received");
        setForm({ username: "", password: "", fullname: "", role: "Cashier" });
        loadAccounts();
      })
      .catch(() => alert("Error creating user"));
  };

  /**
   * moveToBin - UI-level "fake delete"
   * - Does NOT call backend delete
   * - Moves account to frontend bin (localStorage)
   * - Protects from deleting the last Admin
   */
  const moveToBin = (acc) => {
    // Recompute visible admins (accounts state currently excludes bin items)
    const visibleAdmins = accounts.filter((a) => a.role === "Admin");
    if (acc.role === "Admin" && visibleAdmins.length <= 1) {
      return alert("Cannot remove the last admin. At least one Admin must remain.");
    }

    // Move to bin
    setAccountBin((prev) => {
      // avoid duplicates
      if (prev.some((p) => p.user_id === acc.user_id)) return prev;
      return [...prev, acc];
    });

    // Remove from visible accounts immediately for snappy UI
    setAccounts((prev) => prev.filter((a) => a.user_id !== acc.user_id));

    // Close expanded log if it was open
    if (expandedId === acc.user_id) setExpandedId(null);
  };

  /**
   * retrieveFromBin - restores an account from frontend bin to visible accounts
   * - This does not modify DB (account is still in DB)
   * - We remove it from bin storage so it shows again in the accounts list
   */
  const retrieveFromBin = (acc) => {
    setAccountBin((prev) => prev.filter((a) => a.user_id !== acc.user_id));
    // After removing from bin, reload accounts - the fetch in useEffect will do the filtering.
    // But to make it instant, add it back to the visible list optimistically:
    setAccounts((prev) => [acc, ...prev]);
  };

  /**
   * permanentlyDelete (optional) - not requested, so it's commented out.
   * If you want a permanent delete feature you can uncomment and wire it
   * to your backend DELETE endpoint. By default we've left it out.
   */
  // const permanentlyDelete = (acc) => {
  //   if (!window.confirm("Permanently delete this account? This cannot be undone.")) return;
  //   fetch(`http://localhost:8081/users/${acc.user_id}`, { method: "DELETE" })
  //     .then((res) => res.json())
  //     .then((msg) => {
  //       alert(msg.success || msg.error);
  //       // remove from bin
  //       setAccountBin((prev) => prev.filter((a) => a.user_id !== acc.user_id));
  //       loadAccounts();
  //     })
  //     .catch(() => alert("Error deleting user"));
  // };

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

      {/* Bin Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
        <h2>Existing Accounts</h2>
        <div>
          <button
            className="category-manage-btn"
            onClick={() => {
              setShowBin((s) => !s);
            }}
            title="Toggle Account Bin"
          >
            {showBin ? `Hide Account Bin (${accountBin.length})` : `Show Account Bin (${accountBin.length})`}
          </button>
          <button
            style={{ marginLeft: 10 }}
            className="category-manage-btn"
            onClick={() => loadAccounts()}
            title="Refresh accounts from server"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Existing Accounts */}
      <div style={{ marginTop: 12 }}>
        {accounts.length === 0 && <p>No accounts found.</p>}
        {accounts.map((acc) => (
          <div key={acc.user_id} className="account-box account-expand">
            <div className="account-header">
              <div>
                <div className="account-fullname">
                  <span className="account-name">{acc.fullname}</span>
                </div>
                <div className="account-meta-container" style={{ marginTop: 8 }}>
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
                {/* Fake delete -> move to bin */}
                <button
                  className="icon-btn delete-btn"
                  onClick={() => {
                    if (!window.confirm(`Move ${acc.fullname} to Account Bin?`)) return;
                    moveToBin(acc);
                  }}
                  title="Move to Bin"
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
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
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
              <div key={b.user_id} className="account-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{b.fullname}</div>
                  <div style={{ marginTop: 6 }}>
                    <small>Username: <strong>{b.username}</strong></small>
                    <br />
                    <small>Role: <strong>{b.role}</strong></small>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="add-btn"
                    onClick={() => {
                      if (!window.confirm(`Retrieve ${b.fullname} from Bin?`)) return;
                      retrieveFromBin(b);
                    }}
                    title="Retrieve account"
                  >
                    Retrieve
                  </button>

                  {/* If you ever want permanent delete, wire this to your DELETE endpoint.
                      For safety we do not include it by default. */}
                  {/* <button
                    className="delete-btn"
                    onClick={() => {
                      if (!window.confirm(`Permanently delete ${b.fullname}?`)) return;
                      permanentlyDelete(b);
                    }}
                  >
                    Delete Permanently
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
