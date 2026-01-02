const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
} = require("../controllers/product.controller");

// ================= MULTER CONFIGURATION =================
const uploadDir = "uploads/products/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "prod-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

// ================= ROUTES =================
router.get("/stats", getProductStats);
router.get("/", getProducts);
router.post("/", upload.single("productImage"), createProduct);
router.put("/:id", upload.single("productImage"), updateProduct);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

module.exports = router;
