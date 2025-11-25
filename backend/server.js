// server.js
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
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
    SELECT user_id, username, fullname, role 
    FROM users 
    WHERE username=? AND password=? AND role=?
  `;

  db.query(sql, [username, password, role], (err, result) => {
    if (err) return res.status(500).json({ error: "Server error" });

    if (result.length === 0)
      return res.status(401).json({ error: "Invalid credentials or wrong login page" });

    res.json({ success: true, user: result[0] });
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
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// Create user
app.post("/users", (req, res) => {
  const { username, password, fullname, role } = req.body;
  if (!username || !password || !fullname || !role)
    return res.status(400).json({ error: "Missing fields" });

  const sql = `
    INSERT INTO users (username, password, fullname, role, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [username, password, fullname, role], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: "Account created successfully" });
  });
});

// Delete user
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE user_id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
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
    if (err) return res.status(500).json({ error: err });
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
    if (err) return res.status(500).json({ error: err });
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
    if (err) return res.status(500).json({ error: err });
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
    if (err) return res.status(500).json({ error: err });
    res.json({ success: "Product updated" });
  });
});

// Delete product
app.delete("/product/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM product WHERE product_id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
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

  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  const saleSql = `
    INSERT INTO sale (user_id, total_amount, sale_date)
    VALUES (?, ?, NOW())
  `;

  db.query(saleSql, [user_id, totalAmount], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    const saleId = result.insertId;
    const values = items.map((i) => [saleId, i.product_id, i.quantity, i.subtotal]);

    db.query(
      "INSERT INTO sales_detail (sale_id, product_id, quantity, subtotal) VALUES ?",
      [values],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2 });
        res.json({ success: "Sale recorded", sale_id: saleId });
      }
    );
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
    if (err) return res.status(500).json({ error: err });
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
    if (err) return res.status(500).json({ error: err });

    db.query(profitSql, params, (err2, profit) => {
      if (err2) return res.status(500).json({ error: err2 });

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
    if (err) return res.status(500).json({ error: err });

    db.query("DELETE FROM sale WHERE sale_id=?", [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ success: "Sale deleted" });
    });
  });
});

// ===============================
// RUN SERVER
// ===============================
const PORT = 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
