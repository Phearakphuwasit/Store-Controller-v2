const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ----------------------
// Location Schema
// ----------------------
const locationSchema = new mongoose.Schema({
  lat: { type: Number },
  lng: { type: Number },
  city: { type: String, default: "Unknown" },
  country: { type: String, default: "Unknown" },
  timestamp: { type: Date, default: Date.now }
});

// ----------------------
// Notification Schema (New!)
// ----------------------
const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["info", "success", "warning", "error"], 
    default: "info" 
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// ----------------------
// User Schema
// ----------------------
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
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "manager", "staff"],
      default: "user",
    },
    profilePicture: { type: String, default: null },
    notifications: [notificationSchema],
    lastExportAt: { type: Date },
    locations: [locationSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


// --- Virtual for Unread Count ---
UserSchema.virtual('unreadNotificationsCount').get(function() {
  return this.notifications.filter(n => !n.isRead).length;
});
// ----------------------
// Pre-save hook
// ----------------------
UserSchema.pre("save", async function () {
  // Trim + lowercase email on creation/update
  if (this.isModified("email") && this.email) {
    this.email = this.email.trim().toLowerCase();
  }

  // Hash password only if modified
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ----------------------
// Compare password method
// ----------------------
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add this method to the UserSchema.methods section
UserSchema.methods.addNotification = function (title, message, type = 'info') {
  this.notifications.unshift({
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date()
  });
  
  // Keep only the last 20 notifications to save database space
  if (this.notifications.length > 20) {
    this.notifications = this.notifications.slice(0, 20);
  }
  
  return this.save();
};

// ----------------------
// Export Model
// ----------------------
module.exports = mongoose.model("User", UserSchema);
