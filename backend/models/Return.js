const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, trim: true },
    returnedBy: { type: String }, // staff or customer
    returnDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Return", returnSchema);
