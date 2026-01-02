const Category = require("../models/Category");

// Get all categories for the dropdown
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new category (Optional - for setup)
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};