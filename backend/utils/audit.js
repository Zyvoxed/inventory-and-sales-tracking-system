// utils/audit.js
const db = require("../config/db");

/**
 * addAuditLog
 * @param {number} user_id - user performing action
 * @param {string} action - e.g., "Create Product", "Delete Account"
 * @param {string} description - details of the action
 */
function addAuditLog(user_id, action, description) {
    const sql = `
    INSERT INTO audit_log (user_id, action, description)
    VALUES (?, ?, ?)
  `;
    db.query(sql, [user_id, action, description], (err) => {
        if (err) console.error("Audit Log Error:", err);
    });
}

module.exports = addAuditLog;
