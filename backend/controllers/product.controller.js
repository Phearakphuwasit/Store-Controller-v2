const Product = require("../models/Product");

// ================= CREATE PRODUCT (With Image) =================
exports.createProduct = async (req, res) => {
  try {
    const productData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
    };

    if (req.file) {
      productData.image = req.file.path.replace(/\\/g, "/");
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });

  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);

    res.status(400).json({
      success: false,
      message: err.message,
      errors: err.errors || null
    });
  }
};

// ================= UPDATE PRODUCT (With Image) =================
exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/");
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ================= IMPROVED: GET PRODUCT STATS =================
exports.getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $facet: {
          totalStats: [
            { $group: { 
                _id: null, 
                totalCount: { $sum: 1 },
                totalStockValue: { $sum: { $multiply: ["$price", "$stock"] } }
            }}
          ],
          inventoryStatus: [
            { $group: { 
                _id: "$status", 
                count: { $sum: 1 } 
            }}
          ],
          topPerformer: [
            { $sort: { price: -1, stock: -1 } }, // Using price/stock as priority for now
            { $limit: 1 },
            { $project: { name: 1, _id: 0 } }
          ]
        }
      }
    ]);

    const total = stats[0].totalStats[0]?.totalCount || 0;
    const statusArray = stats[0].inventoryStatus;

    // Helper to find specific status counts for the health bar
    const getCount = (id) => statusArray.find(s => s._id === id)?.count || 0;

    res.json({
      success: true,
      stats: {
        totalProducts: total,
        totalValue: stats[0].totalStats[0]?.totalStockValue || 0,
        bestSellerName: stats[0].topPerformer[0]?.name || 'N/A',
        // Pre-calculating percentages for the Health Bar
        health: {
          optimal: total > 0 ? (getCount('In Stock') / total) * 100 : 0,
          warning: total > 0 ? (getCount('Low Stock') / total) * 100 : 0,
          critical: total > 0 ? (getCount('Out of Stock') / total) * 100 : 0
        },
        timestamp: new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ================= GET ALL PRODUCTS =================
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET SINGLE PRODUCT =================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
  }
};

// ================= DELETE PRODUCT =================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};