const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Product name is required"], 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  price: { 
    type: Number, 
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  image: { 
    type: String, 
    default: "uploads/default-product.png" // Path relative to server root
  },
  category: { 
    type: String, // Changed from ObjectId to String to match your Angular Form
    required: [true, "Category is required"],
    trim: true
  },
  stock: { 
    type: Number, 
    min: [0, "Stock cannot be negative"], 
    default: 0
  },
  status: { 
    type: String, 
    enum: ['In Stock', 'Low Stock', 'Out of Stock'], 
    default: 'In Stock' 
  },
  slug: { 
    type: String, 
    unique: true, 
    lowercase: true, 
    trim: true 
  }
}, { 
  timestamps: true 
});

// AUTO-GENERATE SLUG & UPDATE STATUS
productSchema.pre('save', function(next) {
  // Generate Slug
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .split(' ')
      .join('-')
      .replace(/[^\w-]+/g, '');
  }

  // Auto-set status based on stock count
  if (this.stock <= 0) {
    this.status = 'Out of Stock';
  } else if (this.stock <= 5) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);