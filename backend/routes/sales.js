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

<<<<<<< HEAD
// Save pending sales: convert pending_sales_detail rows to confirmed sale + sales_detail + stock decrement
router.post("/save-pending", (req, res) => {
  const { user_id, sale_date } = req.body;
  if (!user_id || !sale_date) {
    return res.status(400).json({ error: "Missing user_id or sale_date" });
  }

  // Fetch all pending items for the given date AND their original sale_date timestamps
  const pendingSql = `
    SELECT pending_id, product_id, quantity, subtotal, sale_date
    FROM pending_sales_detail
    WHERE DATE(sale_date) = DATE(?) AND status = 'pending'
    ORDER BY sale_date ASC
  `;

  db.query(pendingSql, [sale_date], (err, pendingItems) => {
    if (err) return res.status(500).json({ error: err });
    if (!pendingItems || pendingItems.length === 0) {
      return res.status(400).json({ error: "No pending sales for this date" });
    }

    // Begin transaction
    db.beginTransaction((tErr) => {
      if (tErr) return res.status(500).json({ error: tErr });

      // 1. Create a sale record with the FIRST pending transaction's timestamp
      const firstPendingTimestamp = pendingItems[0].sale_date;
      const totalAmount = pendingItems.reduce((sum, i) => sum + Number(i.subtotal || 0), 0);
      const saleSql = `INSERT INTO sale (user_id, total_amount, sale_date) VALUES (?, ?, ?)`;

      db.query(saleSql, [user_id, totalAmount, firstPendingTimestamp], (err1, result) => {
        if (err1) return db.rollback(() => res.status(500).json({ error: err1 }));

        const saleId = result.insertId;
        const values = pendingItems.map((i) => [saleId, i.product_id, i.quantity, i.subtotal]);

        // 2. Insert into sales_detail
        db.query(
          "INSERT INTO sales_detail (sale_id, product_id, quantity, subtotal) VALUES ?",
          [values],
          (err2) => {
            if (err2) return db.rollback(() => res.status(500).json({ error: err2 }));

            // 3. Decrement stock for each item
            const updateStockForItem = (index) => {
              if (index >= pendingItems.length) {
                // 4. Delete pending items
                const pendingIds = pendingItems.map((p) => p.pending_id);
                const deletePendingSql = `DELETE FROM pending_sales_detail WHERE pending_id IN (${pendingIds.map(() => "?").join(",")})`;

                db.query(deletePendingSql, pendingIds, (err4) => {
                  if (err4) return db.rollback(() => res.status(500).json({ error: err4 }));

                  // Commit transaction
                  db.commit((cErr) => {
                    if (cErr) return db.rollback(() => res.status(500).json({ error: cErr }));
                    return res.json({ success: "Pending sales confirmed", sale_id: saleId });
                  });
                });
                return;
              }

              const it = pendingItems[index];

              // First check current stock
              db.query(
                "SELECT quantity_in_stock FROM product WHERE product_id = ?",
                [it.product_id],
                (err3, rows) => {
                  if (err3) return db.rollback(() => res.status(500).json({ error: err3 }));

                  const currentStock = rows && rows[0] ? rows[0].quantity_in_stock : 0;
                  if (Number(currentStock) < Number(it.quantity)) {
                    return db.rollback(() =>
                      res.status(400).json({
                        error: `Insufficient stock for product_id ${it.product_id}. Current stock: ${currentStock}`,
                      })
                    );
                  }

                  // Decrement stock
                  const updSql = `
                    UPDATE product
                    SET quantity_in_stock = quantity_in_stock - ?
                    WHERE product_id = ?
                  `;
                  db.query(updSql, [it.quantity, it.product_id], (err5, resultUpd) => {
                    if (err5) return db.rollback(() => res.status(500).json({ error: err5 }));
                    if (resultUpd.affectedRows === 0) {
                      return db.rollback(() =>
                        res.status(400).json({
                          error: `Failed to update stock for product_id ${it.product_id}`,
                        })
                      );
                    }
                    updateStockForItem(index + 1);
                  });
                }
              );
            };

            updateStockForItem(0);
          }
        );
      });
    });
  });
});

module.exports = router;
