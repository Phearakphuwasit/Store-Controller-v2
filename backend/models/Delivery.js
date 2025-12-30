const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    po: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    deliveryDate: { type: Date, default: Date.now },
    receivedBy: { type: String }, // staff who received the delivery
    status: {
      type: String,
      enum: ["Pending", "Delivered", "Partially Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);
