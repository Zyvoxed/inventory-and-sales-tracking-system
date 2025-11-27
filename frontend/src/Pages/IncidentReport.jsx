// src/Pages/IncidentReport.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import axios from "axios";
import "../assets/styles/IncidentReport.css"; // use the new CSS file

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
      await axios.put(`http://localhost:8081/incident-report/${incident_id}`, {
        status: "Resolved",
      });

      setReports((prev) =>
        prev.map((r) =>
          r.incident_id === incident_id
            ? { ...r, status: "Resolved" }
            : r
        )
      );
    } catch (err) {
      console.error("Failed to update incident:", err.response?.data || err.message);
      alert("Could not update incident status.");
      await loadReports();
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="incident-container">
        <h1 className="page-title">Incident Report</h1>

        {loading && <p className="incident-loading">Loading incident reports...</p>}

        {error && <p className="incident-error">{error}</p>}

        {!loading && !error && reports.length === 0 && (
          <p className="incident-empty">No incident reports found.</p>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="product-table incident-table-wrapper">
            <table className="incident-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Reported By</th>
                  <th>Created At</th>
                  <th>Status</th>
                  <th className="incident-action">Action</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((r) => (
                  <tr key={r.incident_id}>
                    <td>{r.incident_id}</td>

                    <td className="incident-description">
                      {r.description || "-"}
                    </td>

                    <td>{r.reportedby_name || r.reportedby_id || "-"}</td>

                    <td>
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString()
                        : "-"}
                    </td>

                    <td>
                      {r.status === "Resolved" ? (
                        <span className="status-resolved">Resolved</span>
                      ) : (
                        <span className="status-pending">Pending</span>
                      )}
                    </td>

                    <td className="incident-action">
                      {r.status !== "Resolved" ? (
                        <button
                          className="add-btn incident-btn-resolve"
                          onClick={() => markResolved(r.incident_id)}
                          disabled={resolvingId === r.incident_id}
                        >
                          {resolvingId === r.incident_id
                            ? "Resolving..."
                            : "Mark Resolved"}
                        </button>
                      ) : (
                        <button
                          className="incident-btn-resolved"
                          onClick={() => alert("Incident already resolved")}
                        >
                          Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
