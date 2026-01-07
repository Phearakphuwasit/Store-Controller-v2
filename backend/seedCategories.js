// seedCategories.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category'); // adjust path if needed

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Categories to add
const categories = [
  { name: 'Electronics', description: 'All kinds of electronic products' },
  { name: 'Fashion', description: 'Clothing, accessories, and more' },
  { name: 'Home & Living', description: 'Furniture, decor, and essentials' },
  { name: 'Accessories', description: 'Bags, watches, jewelry, etc.' },
  { name: 'Beauty & Health', description: 'Cosmetics, skincare, and wellness' },
  { name: 'Sports & Outdoors', description: 'Fitness, sports, and outdoor equipment' },
  { name: 'Toys & Games', description: 'Toys, puzzles, and games for all ages' },
  { name: 'Automotive', description: 'Car accessories and automotive products' }
];

// Seed function
async function seedCategories() {
  try {
    for (let cat of categories) {
      // Check if category already exists
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        const newCat = await Category.create(cat);
        console.log(`Category "${newCat.name}" created`);
      } else {
        console.log(`Category "${cat.name}" already exists, skipping`);
      }
    }
    mongoose.connection.close();
    console.log('Seeding completed');
  } catch (err) {
    console.error('Seeding error:', err);
    mongoose.connection.close();
  }
}

seedCategories();
