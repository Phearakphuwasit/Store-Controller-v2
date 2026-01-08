const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ================= CONTROLLERS =================
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
} = require("../controllers/product.controller");

// ================= UPLOAD DIRECTORY =================
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "products");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `product-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ================= ROUTES =================

// Stats (must be before :id)
router.get("/stats", getProductStats);

// Get all products
router.get("/", getProducts);

// Get product by ID
router.get("/:id", getProductById);

// Create product (with image)
router.post("/", upload.single("productImage"), createProduct);

// Update product (with optional image)
router.put("/:id", upload.single("productImage"), updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

module.exports = router;
