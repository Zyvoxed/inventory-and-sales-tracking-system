const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const router = express.Router();
const SALT_ROUNDS = 10;

router.post("/login", (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role)
    return res.status(400).json({ error: "Missing credentials" });

  const sql = `
    SELECT user_id, username, fullname, role, password
    FROM users
    WHERE username=? AND role=?
  `;

  db.query(sql, [username, role], (err, result) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (result.length === 0)
      return res
        .status(401)
        .json({ error: "Invalid credentials or wrong login page" });

    const userRow = result[0];
    bcrypt.compare(password, userRow.password, (bErr, same) => {
      if (bErr) return res.status(500).json({ error: "Server error" });
      if (!same)
        return res
          .status(401)
          .json({ error: "Invalid credentials or wrong login page" });

      const { password: _p, ...user } = userRow;
      res.json({ success: true, user });
    });
  });
});

module.exports = router;
