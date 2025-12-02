const bcrypt = require("bcryptjs");
const db = require("../config/db");

const SALT_ROUNDS = 10;

const DEFAULT_ADMIN = {
  username: "testadmin",
  password: "testadmin",
  fullname: "test admin",
  role: "Admin",
};

function createDefaultAdmin() {
  const sqlCheck = "SELECT * FROM users WHERE username = ? AND role = ?";
  db.query(
    sqlCheck,
    [DEFAULT_ADMIN.username, DEFAULT_ADMIN.role],
    async (err, result) => {
      if (err) return console.error("Admin check error:", err);

      if (result.length === 0) {
        // admin does not exist, create it
        try {
          const hash = await bcrypt.hash(DEFAULT_ADMIN.password, SALT_ROUNDS);
          const sqlInsert = `
          INSERT INTO users (username, password, fullname, role, created_at)
          VALUES (?, ?, ?, ?, NOW())
        `;
          db.query(
            sqlInsert,
            [
              DEFAULT_ADMIN.username,
              hash,
              DEFAULT_ADMIN.fullname,
              DEFAULT_ADMIN.role,
            ],
            (err2) => {
              if (err2)
                return console.error("Error creating default admin:", err2);
              console.log("Default admin account created successfully");
            }
          );
        } catch (e) {
          console.error("Error hashing default admin password:", e);
        }
      } else {
        console.log("Default admin already exists");
      }
    }
  );
}

module.exports = createDefaultAdmin;
