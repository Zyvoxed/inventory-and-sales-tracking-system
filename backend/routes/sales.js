const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Add sale + sale items
router.post("/", (req, res) => {
  const { user_id, items } = req.body;
  if (!user_id || !items || items.length === 0)
    return res.status(400).json({ error: "Missing sale data" });

  for (const it of items) {
    if (
      !it.product_id ||
      !Number.isFinite(Number(it.quantity)) ||
      Number(it.quantity) <= 0
    )
      return res.status(400).json({ error: "Invalid item data" });
  }

  const totalAmount = items.reduce(
    (sum, i) => sum + Number(i.subtotal || 0),
    0
  );

  db.beginTransaction((tErr) => {
    if (tErr) return res.status(500).json({ error: tErr });

    const saleSql = `INSERT INTO sale (user_id, total_amount, sale_date) VALUES (?, ?, NOW())`;

    db.query(saleSql, [user_id, totalAmount], (err, result) => {
      if (err) return db.rollback(() => res.status(500).json({ error: err }));

      const saleId = result.insertId;
      const values = items.map((i) => [
        saleId,
        i.product_id,
        i.quantity,
        i.subtotal,
      ]);

      db.query(
        "INSERT INTO sales_detail (sale_id, product_id, quantity, subtotal) VALUES ?",
        [values],
        (err2) => {
          if (err2)
            return db.rollback(() => res.status(500).json({ error: err2 }));

          const updateStockForItem = (index) => {
            if (index >= items.length) {
              return db.commit((cErr) => {
                if (cErr)
                  return db.rollback(() =>
                    res.status(500).json({ error: cErr })
                  );
                return res.json({ success: "Sale recorded", sale_id: saleId });
              });
            }

            const it = items[index];
            const updSql = `
              UPDATE product
              SET quantity_in_stock = quantity_in_stock - ?
              WHERE product_id = ? AND quantity_in_stock >= ?
            `;
            db.query(
              updSql,
              [it.quantity, it.product_id, it.quantity],
              (err3, resultUpd) => {
                if (err3)
                  return db.rollback(() =>
                    res.status(500).json({ error: err3 })
                  );
                if (resultUpd.affectedRows === 0)
                  return db.rollback(() =>
                    res.status(400).json({
                      error: `Insufficient stock for product_id ${it.product_id}`,
                    })
                  );
                updateStockForItem(index + 1);
              }
            );
          };

          updateStockForItem(0);
        }
      );
    });
  });
});

// Get all sales (flattened)
router.get("/", (req, res) => {
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

// Delete sale
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM sales_detail WHERE sale_id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    db.query("DELETE FROM sale WHERE sale_id=?", [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ success: "Sale deleted" });
    });
  });
});

module.exports = router;
