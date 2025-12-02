const express = require("express");
const db = require("../config/db");
const logAction = require("../utils/logger");

const router = express.Router();

// GET all incident reports
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      ir.incident_id,
      ir.reportedby_id,
      u.fullname AS reportedby_name,
      ir.description,
      ir.status,
      DATE_FORMAT(ir.created_at, '%Y-%m-%d %H:%i:%s') AS created_at
    FROM incident_report ir
    LEFT JOIN users u ON u.user_id = ir.reportedby_id
    ORDER BY ir.created_at DESC
  `;
  db.query(sql, (err, data) => {
    if (err)
      return res.status(500).json({ error: "Failed to load incident reports" });
    res.json(data);
  });
});

// POST create a new incident report
router.post("/", (req, res) => {
  const { reportedby_id, description, status } = req.body;
  if (!reportedby_id || !description || description.toString().trim() === "")
    return res
      .status(400)
      .json({ error: "reportedby_id and description are required" });

  const incidentStatus = status === "Resolved" ? "Resolved" : "Pending";

  const sql = `
    INSERT INTO incident_report (reportedby_id, description, status, created_at)
    VALUES (?, ?, ?, NOW())
  `;
  db.query(sql, [reportedby_id, description, incidentStatus], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Failed to create incident report" });

    // Log creation
    logAction(
      reportedby_id,
      "Created incident report",
      `Incident ID: ${result.insertId}`
    );

    res.json({ success: true, incident_id: result.insertId });
  });
});

// PUT update status or description
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, description, updatedBy } = req.body;

  if (!id || isNaN(id))
    return res.status(400).json({ error: "Invalid incident ID" });
  if (!status && (description === undefined || description === null))
    return res
      .status(400)
      .json({ error: "Nothing to update (provide status or description)" });

  const sets = [];
  const params = [];
  if (status) {
    sets.push("status = ?");
    params.push(status);
  }
  if (description !== undefined && description !== null) {
    sets.push("description = ?");
    params.push(description);
  }

  const sql = `UPDATE incident_report SET ${sets.join(
    ", "
  )} WHERE incident_id = ?`;
  params.push(id);

  db.query(sql, params, (err, result) => {
    if (err)
      return res.status(500).json({
        error: "Failed to update incident report",
        details: err.message,
      });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Incident not found" });

    // Log update
    if (updatedBy) {
      logAction(
        updatedBy,
        "Updated incident report",
        `Incident ID: ${id}, Fields: ${sets.join(", ")}`
      );
    }

    res.json({ success: true });
  });
});

module.exports = router;
