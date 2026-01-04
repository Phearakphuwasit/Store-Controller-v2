const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  updateLocation,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

const upload = require("../middleware/multerConfig");

router.post(
  "/register",
  (req, res, next) => {
    upload.single("profilePicture")(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  register
);
router.post("/login", login);
router.put(
  "/profile",
  auth,
  (req, res, next) => {
    upload.single("profilePicture")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  updateProfile
);
router.post("/update-location", updateLocation);
router.get("/:id", getProfile);

module.exports = router;
