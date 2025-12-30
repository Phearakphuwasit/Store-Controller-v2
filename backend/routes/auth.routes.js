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
router.post("/register", async (req, res, next) => {
  console.log('Route hit, req.body:', req.body, 'req.files:', req.files);
  try {
    await register(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login user
router.post("/login", async (req, res, next) => {
  try {
    await login(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Get user profile by ID
router.get("/profile/:id", async (req, res, next) => {
  try {
    await getProfile(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res, next) => {
  try {
    await updateProfile(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

module.exports = router;
