// server.js
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;
const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// DATABASE CONNECTION
// ===============================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "inventory_db",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// ===============================
// TEST ROUTE
// ===============================
app.get("/", (req, res) => {
  res.json({ success: "Backend is running" });
});

// ===============================
// LOGIN (ADMIN / CASHIER)
// ===============================
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role)
    return res.status(400).json({ error: "Missing credentials" });

  const sql = `
    SELECT user_id, username, fullname, role, password
    FROM users
    WHERE username=? AND role=?
  `;

  db.query(sql, [username, role], (err, result) => {
    if (err) {
      console.error("POST /login error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (result.length === 0)
      return res.status(401).json({ error: "Invalid credentials or wrong login page" });

    const userRow = result[0];
    const hash = userRow.password;

    bcrypt.compare(password, hash, (bErr, same) => {
      if (bErr) {
        console.error("Bcrypt compare error:", bErr);
        return res.status(500).json({ error: "Server error" });
      }
      if (!same) return res.status(401).json({ error: "Invalid credentials or wrong login page" });

      // Remove password before sending
      const { password: _p, ...user } = userRow;
      res.json({ success: true, user });
    });
  });
});

// ===============================
// USERS CRUD
// ===============================

// Get all users
app.get("/users", (req, res) => {
  const sql = `
    SELECT 
      user_id, username, fullname, role,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
    FROM users
    ORDER BY user_id DESC
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("GET /users error:", err);
      return res.status(500).json({ error: err });
    }
    res.json(data);
  });
});

// Create user
app.post("/users", (req, res) => {
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
        if (err) {
          console.error("POST /users error:", err);
          // handle duplicate username more gracefully
          if (err && err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Username already exists" });
          }
          return res.status(500).json({ error: "Failed to create user", details: err.message });
        }
        return res.status(201).json({ success: "Account created successfully" });
      });
    } catch (e) {
      console.error("Error hashing password:", e);
      return res.status(500).json({ error: "Server error" });
    }
  })();
});

// Delete user
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE user_id=?", [id], (err) => {
    if (err) {
      console.error("DELETE /users/:id error:", err);
      return res.status(500).json({ error: err });
    }
    res.json({ success: "User deleted successfully" });
  });
});

// Get audit logs for a user
app.get("/audit/:user_id", (req, res) => {
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
    if (err) {
      console.error("GET /audit/:user_id error:", err);
      return res.status(500).json({ error: err });
    }
    res.json(data);
  });
});

// ===============================
// PRODUCT CRUD
// ===============================
app.get("/product", (req, res) => {
  const sql = `
    SELECT
      product_id AS ID,
      product_name AS Name,
      category AS Category,
      quantity_in_stock AS Stock,
      price AS Price,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS CreatedAt,
      DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS UpdatedAt
    FROM product
    ORDER BY product_id DESC
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("GET /product error:", err);
      return res.status(500).json({ error: err });
    }
    res.json(data);
  });
});

// Add product
app.post("/product", (req, res) => {
  const { product_name, category, quantity_in_stock, price } = req.body;
  if (!product_name || !category)
    return res.status(400).json({ error: "Missing fields" });

  const sql = `
    INSERT INTO product (product_name, category, quantity_in_stock, price, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [product_name, category, quantity_in_stock, price], (err) => {
    if (err) {
      console.error("POST /product error:", err);
      return res.status(500).json({ error: err });
    }
    res.json({ success: "Product added" });
  });
});

// Update product
app.put("/product/:id", (req, res) => {
  const { id } = req.params;
  const { product_name, category, quantity_in_stock, price } = req.body;

  const sql = `
    UPDATE product
    SET product_name=?, category=?, quantity_in_stock=?, price=?, updated_at=NOW()
    WHERE product_id=?
  `;
  db.query(sql, [product_name, category, quantity_in_stock, price, id], (err) => {
    if (err) {
      console.error("PUT /product/:id error:", err);
      return res.status(500).json({ error: err });
    }
    res.json({ success: "Product updated" });
  });
});

// Delete product
app.delete("/product/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM product WHERE product_id=?", [id], (err) => {
    if (err) {
      console.error("DELETE /product/:id error:", err);
      return res.status(500).json({ error: err });
    }
    res.json({ success: "Product deleted" });
  });
});

// ===============================
// SALES CRUD
// ===============================

// Add sale + sale items
app.post("/sale", (req, res) => {
  const { user_id, items } = req.body;

  if (!user_id || !items || items.length === 0)
    return res.status(400).json({ error: "Missing sale data" });

  // Basic server-side validation
  for (const it of items) {
    if (!it.product_id || !Number.isFinite(Number(it.quantity)) || Number(it.quantity) <= 0) {
      return res.status(400).json({ error: "Invalid item data" });
    }
  }

  const totalAmount = items.reduce((sum, i) => sum + Number(i.subtotal || 0), 0);

  // Use a transaction to insert sale, sales_detail and decrement product stock
  db.beginTransaction((tErr) => {
    if (tErr) {
      console.error("Transaction begin error:", tErr);
      return res.status(500).json({ error: tErr });
    }

    const saleSql = `
      INSERT INTO sale (user_id, total_amount, sale_date)
      VALUES (?, ?, NOW())
    `;

    db.query(saleSql, [user_id, totalAmount], (err, result) => {
      if (err) {
        console.error("INSERT sale error:", err);
        return db.rollback(() => res.status(500).json({ error: err }));
      }

      const saleId = result.insertId;
      const values = items.map((i) => [saleId, i.product_id, i.quantity, i.subtotal]);

      db.query(
        "INSERT INTO sales_detail (sale_id, product_id, quantity, subtotal) VALUES ?",
        [values],
        (err2) => {
          if (err2) {
            console.error("INSERT sales_detail error:", err2);
            return db.rollback(() => res.status(500).json({ error: err2 }));
          }

          // Sequentially decrement stock for each sold item and ensure stock is sufficient
          const updateStockForItem = (index) => {
            if (index >= items.length) {
              // All updates succeeded, commit
              return db.commit((cErr) => {
                if (cErr) {
                  console.error("Commit error:", cErr);
                  return db.rollback(() => res.status(500).json({ error: cErr }));
                }
                return res.json({ success: "Sale recorded", sale_id: saleId });
              });
            }

            const it = items[index];
            const updSql = `
              UPDATE product
              SET quantity_in_stock = quantity_in_stock - ?
              WHERE product_id = ? AND quantity_in_stock >= ?
            `;

            db.query(updSql, [it.quantity, it.product_id, it.quantity], (err3, resultUpd) => {
              if (err3) {
                console.error("Update stock error:", err3);
                return db.rollback(() => res.status(500).json({ error: err3 }));
              }

              if (resultUpd.affectedRows === 0) {
                // Insufficient stock for this product, rollback
                return db.rollback(() =>
                  res.status(400).json({ error: `Insufficient stock for product_id ${it.product_id}` })
                );
              }

              // Proceed to next item
              updateStockForItem(index + 1);
            });
          };

          updateStockForItem(0);
        }
      );
    });
  });
});

// Get all sale items (flattened)
app.get("/sales", (req, res) => {
  const sql = `
    SELECT 
      s.sale_id,
      s.user_id,
      s.total_amount,
      DATE_FORMAT(s.sale_date, '%Y-%m-%d %H:%i:%s') AS sale_date,
      sd.sales_details_id,
      sd.product_id,
      p.product_name,
      p.category,
      sd.quantity,
      sd.subtotal
    FROM sale s
    JOIN sales_detail sd ON sd.sale_id = s.sale_id
    JOIN product p ON sd.product_id = p.product_id
    ORDER BY s.sale_id DESC
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("GET /sales error:", err);
      return res.status(500).json({ error: err });
    }
    res.json(data);
  });
});

// ===============================
// SALES AGGREGATION (FOR CHART)
// ===============================
/*
  GET /sales-aggregate
  Supports:
    ?date=YYYY-MM-DD
    ?month=YYYY-MM
*/
app.get("/sales-aggregate", (req, res) => {
  const { date, month } = req.query;

  let whereClause = "";
  const params = [];

  if (date) {
    whereClause = "WHERE DATE(s.sale_date) = ?";
    params.push(date);
  } else if (month) {
    whereClause = "WHERE DATE_FORMAT(s.sale_date, '%Y-%m') = ?";
    params.push(month);
  }

  const categorySql = `
    SELECT 
      p.category,
      SUM(sd.subtotal) AS total_sales,
      SUM(sd.quantity) AS total_qty
    FROM sales_detail sd
    JOIN sale s ON s.sale_id = sd.sale_id
    JOIN product p ON p.product_id = sd.product_id
    ${whereClause}
    GROUP BY p.category
  `;

  const profitSql = `
    SELECT SUM(sd.subtotal) AS total_profit
    FROM sales_detail sd
    JOIN sale s ON s.sale_id = sd.sale_id
    ${whereClause}
  `;

  db.query(categorySql, params, (err, categories) => {
    if (err) {
      console.error("GET /sales-aggregate category query error:", err);
      return res.status(500).json({ error: err });
    }

    db.query(profitSql, params, (err2, profit) => {
      if (err2) {
        console.error("GET /sales-aggregate profit query error:", err2);
        return res.status(500).json({ error: err2 });
      }

      res.json({
        byCategory: categories || [],
        total_profit: profit[0]?.total_profit || 0,
      });
    });
  });
});

// ===============================
// DELETE SALE
// ===============================
app.delete("/sale/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM sales_detail WHERE sale_id=?", [id], (err) => {
    if (err) {
      console.error("DELETE sales_detail error:", err);
      return res.status(500).json({ error: err });
    }

    db.query("DELETE FROM sale WHERE sale_id=?", [id], (err2) => {
      if (err2) {
        console.error("DELETE sale error:", err2);
        return res.status(500).json({ error: err2 });
      }
      res.json({ success: "Sale deleted" });
    });
  });
});

// ===============================
// INCIDENT REPORT ROUTES (ADDED)
// ===============================

// GET all incident reports
app.get("/incident-report", (req, res) => {
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
    if (err) {
      console.error("GET /incident-report error:", err);
      return res.status(500).json({ error: "Failed to load incident reports" });
    }
    res.json(data);
  });
});

// POST create a new incident report
app.post("/incident-report", (req, res) => {
  const { reportedby_id, description, status } = req.body;

  if (!reportedby_id || !description || description.toString().trim() === "") {
    return res.status(400).json({ error: "reportedby_id and description are required" });
  }

  // default status to 'Pending' if not provided
  const incidentStatus = status && status === "Resolved" ? "Resolved" : "Pending";

  const sql = `
    INSERT INTO incident_report (reportedby_id, description, status, created_at)
    VALUES (?, ?, ?, NOW())
  `;

  db.query(sql, [reportedby_id, description, incidentStatus], (err, result) => {
    if (err) {
      console.error("POST /incident-report error:", err);
      return res.status(500).json({ error: "Failed to create incident report" });
    }
    res.json({ success: true, incident_id: result.insertId });
  });
});

// PUT update status (or description) for a given incident
app.put("/incident-report/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, description } = req.body;

  console.log(`PUT /incident-report/:id received - id: ${id}, status: ${status}, description: ${description}`);

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid incident ID" });
  }

  if (!status && (description === undefined || description === null)) {
    return res.status(400).json({ error: "Nothing to update (provide status or description)" });
  }

  // Build dynamic SET clause
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

  const sql = `UPDATE incident_report SET ${sets.join(", ")} WHERE incident_id = ?`;
  params.push(id);

  console.log("PUT /incident-report/:id - SQL:", sql, "Params:", params);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("PUT /incident-report/:id error:", err.message);
      return res.status(500).json({ error: "Failed to update incident report", details: err.message });
    }
    console.log(`PUT /incident-report/:id - Success! Affected rows: ${result.affectedRows}`);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json({ success: true });
  });
});

// ===============================
// RUN SERVER
// ===============================
const PORT = 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// End of server.js
