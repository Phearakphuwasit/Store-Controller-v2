require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
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

// ----------------------
// Middleware
// ----------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(morgan("dev"));

// REQUIRED: These must come BEFORE routes to parse the incoming data
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// REQUIRED: You must initialize the file upload middleware you imported
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}));
// 2. Optimized Static Folder Serving
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filePath) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // <--- Add this line
  },
}));
app.use("/assets/images", express.static(path.join(__dirname, "assets/images")));

// ----------------------
// API Routes
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
//app.use("/api/categories", categoryRoutes);
//app.use("/api/stock", stockRoutes);
//app.use("/api/purchase-orders", poRoutes);
//app.use("/api/deliveries", deliveryRoutes);
//app.use("/api/returns", returnRoutes);
//app.use("/api/reports/sales", salesReportRoutes);
//app.use("/api/reports/inventory", inventoryReportRoutes);
//app.use("/api/settings", settingsRoutes);

// ----------------------
// Root & Health Check
// ----------------------
app.get("/", (req, res) => res.send("🚀 Store Controller API is running!"));
app.get("/api", (req, res) => res.json({ status: "OK", message: "API is running" }));

// ----------------------
// Serve Angular Frontend
// ----------------------
// ----------------------
// Error Handling Middleware
// ----------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});
// ----------------------
// Start Server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("======================================");
  console.log(`🚀 Store Controller Backend is running on port ${PORT}`);
  console.log(`📡 API available at: http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Frontend served at: http://0.0.0.0:${PORT}`);
  console.log("======================================");
});
