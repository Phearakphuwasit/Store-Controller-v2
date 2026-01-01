const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

// 1. Static/Specific Routes First
router.post("/register", register);
router.post("/login", login);
router.put("/profile", auth, updateProfile);

// 2. Dynamic ID Routes Last
// This prevents "login" or "register" from being treated as an ID
router.get("/:id", getProfile); 

module.exports = router;