const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

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

    // 1️⃣ Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2️⃣ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // 3️⃣ Validate role
    const validRoles = ["user", "admin", "manager", "staff"];
    const userRole = validRoles.includes(role) ? role : "user";

    // 4️⃣ Handle profile picture
    let profilePicture = null;
    if (req.file) {
      profilePicture = req.file.path.replace(/\\/g, "/");
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6️⃣ Create user
    const user = new User({
      fullName,
      email,
      password: hashedPassword, // store hashed password
      role: userRole,
      profilePicture,
    });

    await user.save();

    // 7️⃣ Generate token
    const token = generateToken(user);

    // 8️⃣ Exclude password in response
    const { password: _, ...userData } = user.toObject();

    res.status(201).json({ success: true, user: userData, token });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password, lat, lng } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Optional: store login location
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
        console.warn("Geocoding failed during login:", err.message);
      }
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user.toObject();
    res.json({ success: true, user: userData, token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ================= PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password: _, ...userData } = user.toObject();
    res.json({ success: true, user: userData });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id; // from auth middleware
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    const { fullName, email } = req.body;
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (req.file) updateData.profilePicture = `uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const { password: _, ...userData } = user.toObject();
    res.json({ success: true, message: "Profile updated", user: userData });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= UPDATE LOCATION =================
exports.updateLocation = async (req, res) => {
  try {
    const { userId, lat, lng, city, country } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

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

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, location: { city, country } });
  } catch (err) {
    console.error("UPDATE LOCATION ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
