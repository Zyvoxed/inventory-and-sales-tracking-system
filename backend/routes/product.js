const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Get all products
router.get("/", (req, res) => {
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
router.post("/", (req, res) => {
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
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { product_name, category, quantity_in_stock, price } = req.body;
  const sql = `
    UPDATE product
    SET product_name=?, category=?, quantity_in_stock=?, price=?, updated_at=NOW()
    WHERE product_id=?
  `;
  db.query(
    sql,
    [product_name, category, quantity_in_stock, price, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: "Product updated" });
    }
  );
});

// Delete product
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM product WHERE product_id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: "Product deleted" });
  });
});

module.exports = router;
