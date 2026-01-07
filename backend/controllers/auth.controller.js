const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const axios = require("axios");

// ---------------- HELPERS ----------------

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: { lat, lon: lng, format: "json" },
        headers: { "User-Agent": "StoreBackend/1.0" },
      }
    );
    const { city, town, village, country } = response.data.address || {};
    return {
      city: city || town || village || "Unknown City",
      country: country || "Unknown Country",
    };
  } catch (error) {
    console.error("Geocoding helper error:", error.message);
    return { city: "Unknown City", country: "Unknown Country" };
  }
};

// ---------------- CONTROLLERS ----------------
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role, lat, lng } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    const profilePicture = req.file ? `uploads/${req.file.filename}` : null;
    const locations = [];
    if (lat && lng) {
      const address = await getAddressFromCoords(lat, lng);
      locations.push({
        lat: Number(lat),
        lng: Number(lng),
        ...address,
        timestamp: new Date(),
      });
    }

    const user = new User({
      fullName,
      email,
      password,
      role: role || "user",
      profilePicture,
      locations,
    });

    await user.save();

    await user.addNotification(
      "Welcome to the Team! 🎉",
      `Hi ${user.fullName}, your account has been successfully created. Explore your dashboard to get started.`,
      "success"
    );

    const token = generateToken(user);
    const { password: _, ...userData } = user.toObject();

    res.status(201).json({ success: true, user: userData, token });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, lat, lng } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (lat && lng) {
      const address = await getAddressFromCoords(lat, lng);
      await User.findByIdAndUpdate(user._id, {
        $push: {
          locations: {
            $each: [
              {
                lat: Number(lat),
                lng: Number(lng),
                ...address,
                timestamp: new Date(),
              },
            ],
            $slice: -10,
          },
        },
      });
    }

    const token = generateToken(user);
    const { password: _, ...userData } = (
      await User.findById(user._id)
    ).toObject();

    res.json({ success: true, user: userData, token });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Login failed", error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { password: _, ...userData } = user.toObject();
    res.json({ success: true, user: userData });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};
//====================== UPDATE PROFILE =====================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { fullName, email, phone, address, notifications } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (notifications !== undefined) {
      updateData.notifications =
        notifications === "true" || notifications === true;
    }
    if (email) updateData.email = email.trim().toLowerCase();

    if (req.file) {
      updateData.profilePicture = `uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await user.addNotification(
      "Profile Updated",
      "Your profile information has been successfully updated.",
      "info"
    );
    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    // 1. Get user ID from the 'auth' middleware
    const userId = req.user?.id;
    const { lat, lng, city, country } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }
    const updatedUser = await User.findByIdAndUpdate(
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
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const lastLoc = updatedUser.locations[updatedUser.locations.length - 1];
    res.json({ success: true, location: lastLoc });
  } catch (err) {
    console.error("UPDATE LOCATION ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false });

    // Mark all as read
    user.notifications.forEach((n) => (n.isRead = true));
    await user.save();

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
