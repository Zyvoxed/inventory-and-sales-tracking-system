const db = require("../config/db");

function logAction(userId, action, detail = null) {
  if (!userId) {
    console.warn("Cannot log action without userId, skipping log");
  }

  db.query(
    "INSERT INTO audit_log (user_id, action, description) VALUES (?, ?, ?)",
    [userId, action, detail],
    (err) => {
      if (err) console.error("Audit log error:", err);
    }
  );
}

module.exports = logAction;
