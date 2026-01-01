const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats
} = require("../controllers/product.controller");

// 1. Specific Routes (STRICT)
router.get("/", getProducts);
router.get("/stats", getProductStats); // ✅ Move this ABOVE /:id

// 2. Dynamic ID Routes (GENERIC)
router.get("/:id", getProductById); // ⚠️ This will now ignore the word "stats"
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;