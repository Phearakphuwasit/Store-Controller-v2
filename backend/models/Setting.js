const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "My Small Mart" },
    storeAddress: { type: String, default: "" },
    lowStockThreshold: { type: Number, default: 10 },
    defaultCurrency: { type: String, default: "USD" },
    taxRate: { type: Number, default: 0 }, // percentage
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
