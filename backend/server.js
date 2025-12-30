require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const path = require("path");

// Routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const stockRoutes = require("./routes/stock.routes");
const poRoutes = require("./routes/purchaseOrder.routes");
const deliveryRoutes = require("./routes/delivery.routes");
const returnRoutes = require("./routes/return.routes");
const salesReportRoutes = require("./routes/salesReport.routes");
const inventoryReportRoutes = require("./routes/inventoryReport.routes");
const settingsRoutes = require("./routes/settings.routes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// Serve static files (for images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets/images", express.static(path.join(__dirname, "assets/images")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/stock", stockRoutes);
//app.use("/api/purchase-orders", poRoutes);
// app.use("/api/deliveries", deliveryRoutes);
// app.use("/api/returns", returnRoutes);
// app.use("/api/reports/sales", salesReportRoutes);
// app.use("/api/reports/inventory", inventoryReportRoutes);
// app.use("/api/settings", settingsRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Store Controller API is running!");
});

// Health check route
app.get("/api", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("======================================");
  console.log(`🚀 Store Controller Backend is running on port ${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}/api`);
  console.log("======================================");
});
