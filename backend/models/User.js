const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Improved Location Schema
const locationSchema = new mongoose.Schema({
  // Use names that match your frontend/service payload
  lat: { type: Number }, 
  lng: { type: Number },
  city: { type: String, default: "Unknown" },
  country: { type: String, default: "Unknown" },
  timestamp: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide your full name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Prevents password from being returned in API queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "manager", "staff"], // Added 'staff' as your frontend uses it
      default: "user",
    },
    profilePicture: {
      type: String,
      default: null,
    },
    // CHANGED: Use an array if you want to track location history (best for Uber-style apps)
    // Or keep as a single object if you only want the "current" location
    locations: [locationSchema], 
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);