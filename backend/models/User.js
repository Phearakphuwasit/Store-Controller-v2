const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/* =========================
   Location Schema
========================= */
const locationSchema = new mongoose.Schema(
  {
    lat: Number,
    lng: Number,
    city: { type: String, default: "Unknown" },
    country: { type: String, default: "Unknown" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* =========================
   Notification Schema
========================= */
const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

/* =========================
   User Schema
========================= */
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
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
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin", "manager", "staff"],
      default: "user",
    },

    profilePicture: {
      type: String,
      default: null,
    },

    notifications: {
      type: [notificationSchema],
      default: [],
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: null,
      match: [/^[0-9+()\s-]{6,20}$/, "Invalid phone number"],
    },
    address: {
      type: String,
      trim: true,
      default: null,
      maxlength: 255,
    },
    lastExportAt: Date,

    locations: {
      type: [locationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* =========================
   Virtuals
========================= */
UserSchema.virtual("unreadNotificationsCount").get(function () {
  return this.notifications.filter((n) => !n.isRead).length;
});

/* =========================
   Hooks
========================= */
UserSchema.pre("save", async function () {
  // Normalize email
  if (this.isModified("email")) {
    this.email = this.email.trim().toLowerCase();
  }

  // Hash password only if modified
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

/* =========================
   Methods
========================= */
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Add a new notification
 */
UserSchema.methods.addNotification = async function (
  title,
  message,
  type = "info"
) {
  this.notifications.unshift({
    title,
    message,
    type,
    isRead: false,
  });

  if (this.notifications.length > 20) {
    this.notifications = this.notifications.slice(0, 20);
  }

  return this.save();
};

/**
 * Mark ALL notifications as read
 */
UserSchema.methods.markAllNotificationsAsRead = function () {
  this.notifications.forEach((n) => {
    n.isRead = true;
  });

  return this.save();
};

/**
 * Mark ONE notification as read
 */
UserSchema.methods.markNotificationAsRead = function (notificationId) {
  const notification = this.notifications.id(notificationId);
  if (notification) {
    notification.isRead = true;
  }
  return this.save();
};

/* =========================
   Export
========================= */
module.exports = mongoose.model("User", UserSchema);
