require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Declared here once
const helmet = require("helmet");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");
const path = require("path");

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

// 1. Security & Logging
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS (Removed the duplicate 'const' line)
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan("dev"));

// 3. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 4. File Upload (Note: If using Multer in routes, express-fileupload might conflict)
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 5 * 1024 * 1024 }, 
}));

// 5. Static Folder Serving
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

// Root & Health Check
app.get("/", (req, res) => res.send("🚀 Store Controller API is running!"));
app.get("/api", (req, res) => res.json({ status: "OK", message: "API is running" }));

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
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log("======================================");
});