const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadDir = 'uploads/products/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats
} = require("../controllers/product.controller");

// ================= MULTER CONFIGURATION =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/products/";
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "prod-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed"), false);
  }
});

// ================= ROUTES =================

// 1. Specific/Stats Routes
router.get("/stats", getProductStats);
router.get("/", getProducts);

// 2. Action Routes (Handling Image Upload)
// Note: 'productImage' must match the key used in Angular FormData
router.post("/", upload.single("productImage"), createProduct);
router.put("/:id", upload.single("productImage"), updateProduct);

// 3. Dynamic ID Routes
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

module.exports = router;