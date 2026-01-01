const User = require("../models/User");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const axios = require("axios");

// ================= HELPER =================
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    const { fullName, email, password, role } = req.body;

    // 1️⃣ Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // 3️⃣ Map role correctly
    let userRole = "user"; // default
    if (role === "manager") userRole = "manager";
    else if (role === "admin") userRole = "admin";

    // 4️⃣ Handle profile picture
    let profilePicture = null;
    if (req.files && req.files.profilePicture) {
      const file = req.files.profilePicture;
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed",
        });
      }
      const uploadDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = "profile-" + uniqueSuffix + path.extname(file.name);
      const filepath = path.join(uploadDir, filename);
      await file.mv(filepath);
      profilePicture = `http://54.253.18.25:5000/uploads/${filename}`;
    }

    const user = new User({
      fullName,
      email,
      password,
      role: userRole,
      profilePicture,
    });

    await user.save();

    // 5️⃣ Generate JWT
    const token = generateToken(user);

    // Exclude password from response
    const { password: _, ...userData } = user.toObject();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userData,
      token,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Register failed",
    });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password, latitude, longitude } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // ✅ FIXED LOCATION HANDLING
    if (Number.isFinite(+latitude) && Number.isFinite(+longitude)) {
      let country = "", city = "";

      try {
        const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
          params: { lat: latitude, lon: longitude, format: "json" },
          headers: { "User-Agent": "YourAppName/1.0" }, // REQUIRED by OSM
        });

        const address = response.data.address || {};
        country = address.country || "";
        city = address.city || address.town || address.village || "";
      } catch (err) {
        console.warn("Reverse geocode failed:", err.message);
      }

      if (!user.locations) user.locations = [];

      user.locations.push({
        latitude: Number(latitude),
        longitude: Number(longitude),
        country,
        city,
      });

      await user.save();
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user.toObject();

    res.json({
      success: true,
      message: "Login successful",
      user: userData,
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ================= PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    // 2️⃣ Query the user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3️⃣ Exclude password
    const { password: _, ...userData } = user.toObject();

    res.json({
      success: true,
      user: userData,
    });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
};
// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user
    const { fullName, email } = req.body;

    let updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    // Handle profile picture
    if (req.files && req.files.profilePicture) {
      const file = req.files.profilePicture;
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed",
        });
      }
      const uploadDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = "profile-" + uniqueSuffix + path.extname(file.name);
      const filepath = path.join(uploadDir, filename);
      await file.mv(filepath);
      updateData.profilePicture = `http://54.253.18.25:5000/uploads/${filename}`;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Exclude password
    const { password: _, ...userData } = user.toObject();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Error updating profile",
    });
  }
};
