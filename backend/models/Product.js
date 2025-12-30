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
    default: 0,
    min: [0, "Price cannot be negative"]
  },
  image: { 
    type: String, 
    default: "/assets/images/default-product.png"
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: [true, "Category is required"] 
  },
  stock: { 
    type: Number, 
    min: [0, "Stock cannot be negative"], 
    max: [255, "Stock cannot exceed 255"],
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

// Optional: create slug automatically before saving
productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
