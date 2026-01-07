const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Category name is required"], 
    unique: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  image: { 
    type: String, 
    default: "/assets/images/default-category.png"
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

categorySchema.pre('save', function () {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }
});

module.exports = mongoose.model('Category', categorySchema);
