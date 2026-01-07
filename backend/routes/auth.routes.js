const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  register,
  login,
  getProfile,
  updateProfile,
  updateLocation,
  markNotificationsRead,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth"); // JWT middleware
const upload = require("../middleware/multerConfig"); // multer for file upload

// ==================== PUBLIC ROUTES ====================
// Register a new user with optional profile picture
router.post("/register", upload.single("profilePicture"), register);

// Login user
router.post("/login", login);

// ==================== PROTECTED ROUTES ====================
// Get current user profile
router.get("/profile", auth, getProfile);

// Get profile by user ID
router.get("/user/:id", auth, getProfile);

// Update profile with optional profile picture
router.put("/profile", auth, upload.single("profilePicture"), updateProfile);

// Update user's current location
router.post("/update-location", auth, updateLocation);

// Mark all notifications as read
router.put("/notifications/read", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.notifications.forEach((n) => (n.read = true));
    await user.save();

    res.json({
      success: true,
      message: "All notifications marked as read",
      notifications: user.notifications,
    });
  } catch (error) {
    console.error("Mark notifications read error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Log export activity
router.post("/export-log", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { lastExportAt: new Date() });
    res.json({ success: true, message: "Export logged successfully" });
  } catch (err) {
    console.error("Export log error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// Export inventory with notification
router.get("/export-inventory", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Send notification
    await user.addNotification(
      "Data Exported",
      `A CSV export of the inventory was generated on ${new Date().toLocaleString()}.`,
      "info"
    );

    res.json({ success: true, message: "Export logged and notification sent" });
  } catch (err) {
    console.error("Export inventory error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
