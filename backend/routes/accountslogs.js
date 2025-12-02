const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/logs", (req, res) => {
  const sql = `
    SELECT 
      l.log_id,
      l.user_id,
      u.username AS user,
      l.action,
      l.description,
      l.timestamp
    FROM audit_log l
    LEFT JOIN users u ON l.user_id = u.user_id
    ORDER BY l.timestamp DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB logs error:", err);
      return res.status(500).json({ error: "Failed to fetch audit logs." });
    }
    res.json(results);
  });
});

module.exports = router;
