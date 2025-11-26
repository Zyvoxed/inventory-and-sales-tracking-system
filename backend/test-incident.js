// Quick test to check incident_report table structure and test update
const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "inventory_db",
});

db.connect((err) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL");

  // Check table structure
  console.log("\n=== Checking incident_report table structure ===");
  db.query("DESCRIBE incident_report", (err, rows) => {
    if (err) {
      console.error("Error describing table:", err);
    } else {
      console.table(rows);
    }

    // Get sample incident
    console.log("\n=== Fetching sample incidents ===");
    db.query("SELECT * FROM incident_report LIMIT 3", (err, incidents) => {
      if (err) {
        console.error("Error fetching incidents:", err);
      } else {
        console.log("Sample incidents:", incidents);

        if (incidents.length > 0) {
          const incident = incidents[0];
          console.log("\n=== Testing update on incident_id", incident.incident_id, "===");

          // Try to update
          const updateSql = "UPDATE incident_report SET status = ? WHERE incident_id = ?";
          const params = ["Resolved", incident.incident_id];

          console.log("SQL:", updateSql);
          console.log("Params:", params);

          db.query(updateSql, params, (err, result) => {
            if (err) {
              console.error("Update error:", err);
            } else {
              console.log("Update result:", result);
              console.log("Affected rows:", result.affectedRows);

              // Verify update
              db.query(
                "SELECT * FROM incident_report WHERE incident_id = ?",
                [incident.incident_id],
                (err, updated) => {
                  if (err) {
                    console.error("Error verifying:", err);
                  } else {
                    console.log("Updated incident:", updated);
                  }
                  process.exit(0);
                }
              );
            }
          });
        } else {
          process.exit(0);
        }
      }
    });
  });
});
