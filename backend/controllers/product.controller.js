const Product = require("../models/Product");

// ================= CREATE PRODUCT (With Image) =================
exports.createProduct = async (req, res) => {
  try {
    // req.body contains text fields (name, price, etc.)
    // req.file contains the image handled by Multer
    const productData = { ...req.body };

    if (req.file) {
      // Save the path to the database (replace backslashes for URL compatibility)
      productData.image = req.file.path.replace(/\\/g, "/");
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ 
      success: true, 
      message: "Product created successfully",
      product 
    });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(400).json({ success: false, message: err.message });
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
          ]
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts: stats[0].totalStats[0]?.totalCount || 0,
        totalValue: stats[0].totalStats[0]?.totalStockValue || 0,
        statusBreakdown: stats[0].inventoryStatus,
        timestamp: new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};