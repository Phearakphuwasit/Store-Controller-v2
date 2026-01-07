const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  register,
  login,
  getProfile,
  updateProfile,
  updateLocation,
  markNotificationsRead
} = require("../controllers/auth.controller");

const auth = require("../middleware/auth"); 
const upload = require("../middleware/multerConfig");

// ... Public Routes ...
router.post("/register", upload.single("profilePicture"), register);
router.post("/login", login);

// ... Protected Routes ...
router.put("/profile", auth, upload.single("profilePicture"), updateProfile);
router.get("/profile", auth, getProfile); 
router.get("/user/:id", auth, getProfile); 

//======================== Location & Notifications ====================
router.post("/update-location", auth, updateLocation);
router.put('/notifications/read', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notifications.forEach(n => n.read = true);
    
    await user.save();
    res.status(200).json({ 
      message: 'Notifications marked as read', 
      notifications: user.notifications 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post("/export-log", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { 
      lastExportAt: new Date() 
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.get("/export-inventory", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    await user.addNotification(
      "Data Exported",
      `A CSV export of the inventory was generated on ${new Date().toLocaleString()}.`,
      "info"
    );

    res.json({ success: true, message: "Export logged and notification sent" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;