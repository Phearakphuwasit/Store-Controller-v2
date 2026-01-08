// routes/auth.routes.js
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth"); // MUST be a function
const upload = require("../middleware/multerConfig");

// ==================== PUBLIC ROUTES ====================

// Register
router.post(
  "/register",
  upload.single("profilePicture"),
  authController.register
);

// Login
router.post("/login", authController.login);

// ==================== PROTECTED ROUTES ====================

// Get current user profile
router.get(
  "/profile",
  authMiddleware,
  authController.getProfile
);

// Get user by ID
router.get(
  "/user/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({ success: true, user });
    } catch (err) {
      console.error("GET USER ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Update profile
router.put(
  "/profile",
  authMiddleware,
  upload.single("profilePicture"),
  authController.updateProfile
);

// Update user location
router.post(
  "/update-location",
  authMiddleware,
  authController.updateLocation
);

// ==================== NOTIFICATIONS ====================

// Mark ONE notification as read
router.put(
  "/notifications/:id/read",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const notification = user.notifications.id(req.params.id);
      if (notification) {
        notification.isRead = true;
        await user.save();
      }

      res.json({ success: true });
    } catch (err) {
      console.error("MARK NOTIFICATION ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Mark ALL notifications as read
router.put(
  "/notifications/read",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.notifications.forEach((n) => {
        n.isRead = true;
      });

      await user.save();

      res.json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (err) {
      console.error("MARK ALL ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Optional controller-based route
router.put(
  "/notifications/read-all",
  authMiddleware,
  authController.markNotificationsRead
);

// ==================== EXPORT / LOG ====================

// Export log
router.post(
  "/export-log",
  authMiddleware,
  async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user.id, {
        lastExportAt: new Date(),
      });

      res.json({
        success: true,
        message: "Export logged successfully",
      });
    } catch (err) {
      console.error("EXPORT LOG ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Export inventory + notification
router.get(
  "/export-inventory",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (typeof user.addNotification === "function") {
        await user.addNotification(
          "Data Exported",
          `Inventory exported on ${new Date().toLocaleString()}`,
          "info"
        );
      }

      res.json({
        success: true,
        message: "Export logged and notification sent",
      });
    } catch (err) {
      console.error("EXPORT INVENTORY ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

module.exports = router;
