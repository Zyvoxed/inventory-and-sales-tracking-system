const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const router = express.Router();
const SALT_ROUNDS = 10;

// Get all users
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      user_id, username, fullname, role,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
    FROM users
    ORDER BY user_id DESC
  `;
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// Create user
router.post("/", (req, res) => {
  (async () => {
    const { username, password, fullname, role } = req.body;
    if (!username || !password || !fullname || !role)
      return res.status(400).json({ error: "Missing fields" });

    const sql = `
      INSERT INTO users (username, password, fullname, role, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    try {
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      db.query(sql, [username, hash, fullname, role], (err) => {
        if (err && err.code === "ER_DUP_ENTRY")
          return res.status(409).json({ error: "Username already exists" });
        if (err)
          return res
            .status(500)
            .json({ error: "Failed to create user", details: err.message });
        return res
          .status(201)
          .json({ success: "Account created successfully" });
      });
    } catch (e) {
      return res.status(500).json({ error: "Server error" });
    }
  })();
});

// Delete user
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE user_id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: "User deleted successfully" });
  });
});

// Get audit logs for a user
router.get("/audit/:user_id", (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT 
      log_id, user_id, action, description,
      DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') AS timestamp
    FROM audit_log
    WHERE user_id=?
    ORDER BY timestamp DESC
  `;
  db.query(sql, [user_id], (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

module.exports = router;
