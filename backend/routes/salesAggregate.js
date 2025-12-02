const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/", (req, res) => {
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

module.exports = router;
