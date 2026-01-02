const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  updateLocation
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");


const upload = require("../middleware/multerConfig"); 

router.post("/register", upload.single("profilePicture"), register); 
router.post("/login", login);
router.put("/profile", auth, upload.single("profilePicture"), updateProfile);
router.post("/update-location", updateLocation);
router.get("/:id", getProfile); 

module.exports = router;