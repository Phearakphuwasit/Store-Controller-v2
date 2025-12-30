const mongoose = require("mongoose");

const inventoryReportSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    stock: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
    reportDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryReport", inventoryReportSchema);
