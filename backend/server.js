// server.js
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "inventory_db",
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.json({ success: "Backend is running" });
});

/* =========================================================
    LOGIN (ADMIN / CASHIER)
========================================================= */
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
      return res
        .status(401)
        .json({ error: "Invalid credentials or wrong login page" });

    res.json({ success: true, user: result[0] });
  });
});

/* =========================================================
    USERS CRUD + AUDIT LOG
========================================================= */

// Get all users
app.get("/users", (req, res) => {
  const sql = `
    SELECT user_id, username, fullname, role, IFNULL(DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s'), '') AS created_at
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

  const sql = "DELETE FROM users WHERE user_id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: "User deleted" });
  });
});

// Get audit logs for a user
app.get("/audit/:user_id", (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT log_id, user_id, action, description, IFNULL(DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s'), '') AS timestamp
    FROM audit_log
    WHERE user_id=?
    ORDER BY timestamp DESC
  `;

  db.query(sql, [user_id], (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

/* =========================================================
    PRODUCTS CRUD
========================================================= */

// GET all products
app.get("/product", (req, res) => {
  const sql = `
    SELECT 
      product_id AS ID,
      product_name AS Name,
      category AS Category,
      quantity_in_stock AS Stock,
      price AS Price,
      IFNULL(DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s'), NOW()) AS CreatedAt,
      IFNULL(DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s'), NOW()) AS UpdatedAt
    FROM product
    ORDER BY product_id DESC
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// ADD new product
app.post("/product", (req, res) => {
  const { product_name, category, quantity_in_stock, price } = req.body;

  const qty = Number(quantity_in_stock);
  const pr = Number(price);

  if (!product_name || !category || isNaN(qty) || isNaN(pr))
    return res.status(400).json({ error: "Missing or invalid fields" });

  const sql = `
    INSERT INTO product (product_name, category, quantity_in_stock, price, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [product_name, category, qty, pr], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: "Product added successfully" });
  });
});

// UPDATE product
app.put("/product/:id", (req, res) => {
  const { id } = req.params;
  const { product_name, category, quantity_in_stock, price } = req.body;

  const qty = Number(quantity_in_stock);
  const pr = Number(price);

  if (!product_name || !category || isNaN(qty) || isNaN(pr))
    return res.status(400).json({ error: "Missing or invalid fields" });

  const sql = `
    UPDATE product
    SET product_name=?, category=?, quantity_in_stock=?, price=?, updated_at=NOW()
    WHERE product_id=?
  `;

  db.query(sql, [product_name, category, qty, pr, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: "Product updated successfully" });
  });
});

// DELETE product
app.delete("/product/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM product WHERE product_id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: "Product deleted successfully" });
  });
});

/* =========================================================
    SALES CRUD
========================================================= */

// ADD NEW SALE + DETAILS
app.post("/sale", (req, res) => {
  const { user_id, items } = req.body;
  if (!user_id || !items || items.length === 0) {
    return res.status(400).json({ error: "Missing sale data" });
  }
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  const saleSql = `
    INSERT INTO sale (user_id, total_amount, sale_date)
    VALUES (?, ?, NOW())
  `;

  db.query(saleSql, [user_id, totalAmount], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    const saleId = result.insertId;

    const detailSql = `
      INSERT INTO sales_detail (sale_id, product_id, quantity, subtotal)
      VALUES ?
    `;

    const values = items.map((i) => [saleId, i.product_id, i.quantity, i.subtotal]);

    db.query(detailSql, [values], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ success: "Sale recorded", sale_id: saleId });
    });
  });
});

// GET ALL SALES (flattened with product info)
app.get("/sales", (req, res) => {
  const sql = `
    SELECT 
      s.sale_id,
      s.user_id,
      s.total_amount,
      DATE_FORMAT(s.sale_date, '%Y-%m-%d %H:%i:%s') AS sale_date,
      sd.sales_details_id,
      p.product_name,
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

// DELETE SALE + ALL SALES_DETAIL ITEMS
app.delete("/sale/:id", (req, res) => {
  const { id } = req.params;
  // Delete all sales_detail for this sale
  const delDetails = "DELETE FROM sales_detail WHERE sale_id=?";
  db.query(delDetails, [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    // Delete sale record
    const delSale = "DELETE FROM sale WHERE sale_id=?";
    db.query(delSale, [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ success: "Sale and all sale items deleted successfully" });
    });
  });
});

// UPDATE SALE ITEM
app.put("/sale/:id", (req, res) => {
  const { id } = req.params;
  const { quantity, subtotal } = req.body;

  if (!quantity || !subtotal)
    return res.status(400).json({ error: "Missing fields" });

  const sql = `
    UPDATE sales_detail
    SET quantity=?, subtotal=?, updated_at=NOW()
    WHERE sales_details_id=?
  `;

  db.query(sql, [quantity, subtotal, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: "Sale item updated successfully" });
  });
});

/* =========================================================
    START SERVER
========================================================= */
app.listen(8081, () => console.log("Server running on port 8081"));
