const express = require("express");
const db = require("../config/db");
const logAction = require("../utils/logger");

const router = express.Router();

// Get all products with total sold and subtotal
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      p.product_id AS ID,
      p.product_name AS Name,
      p.category AS Category,
      p.quantity_in_stock AS Stock,
      p.price AS Price,
      DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') AS CreatedAt,
      DATE_FORMAT(p.updated_at, '%Y-%m-%d %H:%i:%s') AS UpdatedAt,
      IFNULL(SUM(sd.quantity), 0) AS Sold,
      IFNULL(SUM(sd.quantity) * p.price, 0) AS Subtotal
    FROM product p
    LEFT JOIN sales_detail sd ON p.product_id = sd.product_id
    GROUP BY p.product_id
    ORDER BY p.product_id DESC
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// Add product
router.post("/", (req, res) => {
  const { product_name, category, quantity_in_stock, price, userId } = req.body;
  if (!product_name || !category)
    return res.status(400).json({ error: "Missing fields" });

  const sql = `
    INSERT INTO product (product_name, category, quantity_in_stock, price, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(
    sql,
    [product_name, category, quantity_in_stock, price],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      // Log action with user ID
      logAction(userId, "Add Product", `Added product ${product_name}`);
      res.json({ success: "Product added", productId: result.insertId });
    }
  );
});

// Update product
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { product_name, category, quantity_in_stock, price, userId } = req.body;
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

      logAction(userId, "Update Product", `Updated product ${product_name}`);
      res.json({ success: "Product updated" });
    }
  );
});

// Delete product
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.body?.userId || null;
  db.query("DELETE FROM product WHERE product_id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });

    logAction(userId, "Delete Product", `Deleted product ID ${id}`);
    res.json({ success: "Product deleted" });
  });
});

module.exports = router;
