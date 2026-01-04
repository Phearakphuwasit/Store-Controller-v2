const User = require("../models/User");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const axios = require("axios");

// ================= HELPER =================
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    const validRoles = ["user", "admin", "manager", "staff"];
    const userRole = validRoles.includes(role) ? role : "user";

    let profilePicture = null;
    if (req.file) {
      profilePicture = req.file.path.replace(/\\/g, "/");
    }

    const user = new User({
      fullName,
      email,
      password, // ✅ plain password ONLY
      role: userRole,
      profilePicture,
    });

    await user.save(); // pre("save") hashes it

    const token = generateToken(user);
    const { password: _, ...userData } = user.toObject();

    res.status(201).json({ success: true, user: userData, token });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res, next) => {
  // Added next
  try {
    const { email, password, lat, lng } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (lat && lng) {
      try {
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/reverse",
          {
            params: { lat, lon: lng, format: "json" },
            headers: { "User-Agent": "StoreBackend/1.0" },
          }
        );

        const { city, town, village, country } = response.data.address || {};
        user.locations.push({
          lat: Number(lat),
          lng: Number(lng),
          city: city || town || village || "Unknown City",
          country: country || "Unknown Country",
          timestamp: new Date(),
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
// ================= UPDATE PROFILE (Fixed for Multer) =================
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, email } = req.body;

    let updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    // Handle profile picture via MULTER
    if (req.file) {
      updateData.profilePicture = `uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const { password: _, ...userData } = user.toObject();
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
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
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, location: { city, country } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
