const mongoose = require('mongoose');

const stockLevelSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, "Product is required"]
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, "Quantity cannot be negative"],
    default: 0
  },
  warehouse: {
    type: String, // optional: warehouse or shelf location
    trim: true,
    default: "Main Warehouse"
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  }
}, { 
  timestamps: true // automatically adds createdAt and updatedAt
});

// Update stock status before saving
stockLevelSchema.pre('save', function(next) {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity < 10) { // threshold for low stock
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

module.exports = mongoose.model('StockLevel', stockLevelSchema);
