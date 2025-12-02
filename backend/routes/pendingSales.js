const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Ensure pending table exists and then insert items
router.post("/", (req, res) => {
  const { user_id, items } = req.body;
  if (!user_id || !items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "Missing pending sale data" });

  // Create table if not exists (safe to run repeatedly)
  const createSql = `
    CREATE TABLE IF NOT EXISTS pending_sales_detail (
      pending_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      product_id INT,
      quantity INT,
      subtotal DECIMAL(10,2),
      sale_date DATETIME DEFAULT NOW(),
      status VARCHAR(20) DEFAULT 'pending'
    )`;

  db.query(createSql, (cErr) => {
    if (cErr) return res.status(500).json({ error: cErr });

    const values = items.map((i) => [user_id, i.product_id, i.quantity, i.subtotal]);
    const insertSql = `INSERT INTO pending_sales_detail (user_id, product_id, quantity, subtotal) VALUES ?`;
    db.query(insertSql, [values], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: 'Pending sale recorded' });
    });
  });
});

// Get all pending sales (flattened)
router.get("/", (req, res) => {
  const sql = `
    SELECT
      CONCAT('pending_', psd.pending_id) AS sale_id,
      psd.pending_id AS sales_details_id,
      psd.user_id,
      psd.product_id,
      p.product_name,
      psd.quantity,
      psd.subtotal,
      DATE_FORMAT(psd.sale_date, '%Y-%m-%d %H:%i:%s') AS sale_date
    FROM pending_sales_detail psd
    JOIN product p ON psd.product_id = p.product_id
    WHERE psd.status = 'pending'
    ORDER BY psd.sale_date DESC
  `;
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// Delete a pending sale row by pending_id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM pending_sales_detail WHERE pending_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: 'Pending item deleted' });
  });
});

module.exports = router;
