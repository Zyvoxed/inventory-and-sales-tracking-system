// src/Pages/IncidentReport.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import axios from "axios";
import "../assets/styles/Accounts.css"; // reuse accounts style (provided)

export default function IncidentReport() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:8081/incident-report");
      // Expecting an array of reports from backend
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load incident reports:", err);
      setError("Could not load incident reports.");
    } finally {
      setLoading(false);
    }
  };

  const markResolved = async (incident_id) => {
    if (!window.confirm("Mark this incident as Resolved?")) return;
    setResolvingId(incident_id);
    try {
      // Send a PUT to update status — backend should accept this
      console.log(`Updating incident ${incident_id} to Resolved`);
      await axios.put(`http://localhost:8081/incident-report/${incident_id}`, {
        status: "Resolved",
      });
      console.log(`Successfully updated incident ${incident_id}`);
      // Optimistically update UI
      setReports((prev) =>
        prev.map((r) =>
          r.incident_id === incident_id ? { ...r, status: "Resolved" } : r
        )
      );
    } catch (err) {
      console.error("Failed to mark resolved:", err.response?.data || err.message);
      alert("Could not update incident status.");
      // Reload reports to revert UI to correct state
      await loadReports();
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <Sidebar />
      {/* MAIN CONTENT */}
      <div style={{ marginLeft: 16, marginTop: 8 }}>
        <h1 className="page-title">Incident Report</h1>

        {loading ? (
          <p>Loading incident reports...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : reports.length === 0 ? (
          <p>No incident reports found.</p>
        ) : (
          <div className="product-table" style={{ maxWidth: "1000px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "12px" }}>ID</th>
                  <th style={{ textAlign: "left", padding: "12px" }}>Description</th>
                  <th style={{ textAlign: "left", padding: "12px" }}>Reported By</th>
                  <th style={{ textAlign: "left", padding: "12px" }}>Created At</th>
                  <th style={{ textAlign: "left", padding: "12px" }}>Status</th>
                  <th style={{ textAlign: "center", padding: "12px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.incident_id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px", verticalAlign: "top" }}>{r.incident_id}</td>
                    <td style={{ padding: "12px", verticalAlign: "top", maxWidth: 420, whiteSpace: "pre-wrap" }}>
                      {r.description || "-"}
                    </td>
                    <td style={{ padding: "12px", verticalAlign: "top" }}>
                      {/* If backend returns reportedby name, show it; otherwise show id */}
                      {r.reportedby_name || r.reportedby_id || "-"}
                    </td>
                    <td style={{ padding: "12px", verticalAlign: "top" }}>
                      {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                    </td>
                    <td style={{ padding: "12px", verticalAlign: "top" }}>
                      {r.status === "Resolved" ? (
                        <span style={{ color: "#059669", fontWeight: 700 }}>Resolved</span>
                      ) : (
                        <span style={{ color: "#d97706", fontWeight: 700 }}>Pending</span>
                      )}
                    </td>
                    <td style={{ padding: "12px", verticalAlign: "top", textAlign: "center" }}>
                      {r.status !== "Resolved" ? (
                        <button
                          className="add-btn"
                          onClick={() => markResolved(r.incident_id)}
                          disabled={resolvingId === r.incident_id}
                          style={{ padding: "8px 12px", background: "#10b981" }}
                        >
                          {resolvingId === r.incident_id ? "Resolving..." : "Mark Resolved"}
                        </button>
                      ) : (
                        <button
                          className="cancel-btn"
                          onClick={() => alert("Incident already resolved")}
                          style={{ padding: "8px 12px", background: "#9ca3af" }}
                        >
                          Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 12 }}>
              <button className="category-manage-btn" onClick={loadReports}>
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
