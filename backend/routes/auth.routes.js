const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

// Register a new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Get user profile by ID (no auth required, optional: add auth if needed)
router.get("/:id", getProfile); // easier for frontend: /api/auth/:id

// Update user profile (requires auth)
router.put("/profile", auth, updateProfile);

module.exports = router;
