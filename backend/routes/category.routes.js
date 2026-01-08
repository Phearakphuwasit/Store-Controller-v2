const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Category = require("../models/Category");

// ================= MULTER CONFIG =================
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "categories");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `category-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// ================= ROUTES =================

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE a new category (with optional image)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Category name is required" });

    const image = req.file ? `/uploads/categories/${req.file.filename}` : undefined;

    const category = await Category.create({ name, description, image });
    res.status(201).json({ success: true, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE category (with optional new image)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    // Delete old image if a new one is uploaded
    if (req.file && category.image) {
      const oldPath = path.join(__dirname, "..", category.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.image = req.file ? `/uploads/categories/${req.file.filename}` : category.image;

    await category.save();
    res.json({ success: true, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    // Delete image file
    if (category.image) {
      const imgPath = path.join(__dirname, "..", category.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await category.remove();
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
