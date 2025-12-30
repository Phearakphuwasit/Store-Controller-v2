const mongoose = require("mongoose");

const salesReportSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantitySold: { type: Number, required: true, min: 0 },
    totalRevenue: { type: Number, required: true, min: 0 },
    reportDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesReport", salesReportSchema);
