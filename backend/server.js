const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/product");
const salesRoutes = require("./routes/sales");
const salesAggregateRoutes = require("./routes/salesAggregate");
const incidentReportRoutes = require("./routes/incidentReport");
const createDefaultAdmin = require("./utils/initAdmin");

// Mount routes
app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/product", productRoutes);
app.use("/sales", salesRoutes);
app.use("/sales-aggregate", salesAggregateRoutes);
app.use("/incident-report", incidentReportRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ success: "Backend is running" });
});

// Connect DB and create default admin
db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("Connected to MySQL");
    createDefaultAdmin();
  }
});

const PORT = 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
