require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Declared here once
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const path = require("path");
const multer = require('multer');

// Routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");

const app = express();

// Connect to MongoDB
connectDB();

// ----------------------
// Middleware
// ----------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan("dev"));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  },
}));
app.use("/assets/images", express.static(path.join(__dirname, "assets/images")));

// ----------------------
// API Routes
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Root & Health Check
app.get("/", (req, res) => res.send("🚀 Store Controller API is running!"));
app.get("/api", (req, res) => res.json({ status: "OK", message: "API is running" }));

// ----------------------
// Error Handling Middleware
// ----------------------
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading (e.g., file too large)
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({ success: false, message: err.message });
  }
  next();
});
// ----------------------
// Start Server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("======================================");
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log("======================================");
});