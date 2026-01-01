const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  register,
  login,
  getProfile,
  updateProfile,
  updateLocation
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.put("/profile", auth, updateProfile);
router.post("/update-location", updateLocation);
router.get("/:id", getProfile); 

module.exports = router;