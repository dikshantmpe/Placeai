const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "placeprep_secret_key";

// Register with Email
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

    const token = jwt.sign({ userId: user._id, name: user.name, email: user.email }, JWT_SECRET);
    res.json({ token, user: { name: user.name, email: user.email, avatar: user.avatar } });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login with Email
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ userId: user._id, name: user.name, email: user.email }, JWT_SECRET);
    res.json({ token, user: { name: user.name, email: user.email, avatar: user.avatar } });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google Login
router.post("/google", async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, avatar, provider: "google" });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id, name: user.name, email: user.email }, JWT_SECRET);
    res.json({ token, user: { name: user.name, email: user.email, avatar: user.avatar } });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;