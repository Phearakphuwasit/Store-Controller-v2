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
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Map role correctly (Now including 'staff')
    let userRole = "user"; 
    const validRoles = ["user", "admin", "manager", "staff"];
    if (validRoles.includes(role)) {
      userRole = role;
    }

    // Handle profile picture
    let profilePicture = null;
    if (req.files && req.files.profilePicture) {
      const file = req.files.profilePicture;
      const uploadDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const filename = `profile-${Date.now()}${path.extname(file.name)}`;
      const filepath = path.join(uploadDir, filename);
      await file.mv(filepath);
      
      // Use relative path for database, construct full URL in frontend or via getter
      profilePicture = `uploads/${filename}`;
    }

    const user = new User({
      fullName,
      email,
      password,
      role: userRole,
      profilePicture,
    });

    await user.save();
    const token = generateToken(user);
    const { password: _, ...userData } = user.toObject();

    res.status(201).json({ success: true, user: userData, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password, lat, lng } = req.body; // Changed from latitude/longitude

    const user = await User.findOne({ email }).select("+password"); // Need +password because we used select:false
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Geocoding Logic
    if (lat && lng) {
      try {
        const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
          params: { lat, lon: lng, format: "json" },
          headers: { "User-Agent": "StoreBackend/1.0" },
        });

        const { city, town, village, country } = response.data.address || {};
        user.locations.push({
          lat: Number(lat),
          lng: Number(lng),
          city: city || town || village || "Unknown City",
          country: country || "Unknown Country",
          timestamp: new Date()
        });
        await user.save();
      } catch (err) {
        console.warn("Geocoding failed during login");
      }
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user.toObject();
    res.json({ success: true, user: userData, token });
  } catch (err) {
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

// ================= UPDATE LOCATION (Standalone) =================
exports.updateLocation = async (req, res) => {
  try {
    const { userId, lat, lng, city, country } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          locations: {
            lat: Number(lat),
            lng: Number(lng),
            city: city || "Unknown",
            country: country || "Unknown",
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, location: { city, country } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};