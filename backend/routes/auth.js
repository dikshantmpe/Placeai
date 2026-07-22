const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { getAuth } = require("firebase-admin/auth");
const User = require("../models/User");

const router = express.Router();

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email validation regex
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Password validation
const isValidPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^a-zA-Z0-9]/.test(password)) return false;
  return true;
};

// POST: Register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8+ chars with uppercase, lowercase, number, and special character"
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: "email",
      isVerified: false,
      verificationToken
    });

    await user.save();

    const verificationLink = `http://localhost:5001/api/auth/verify/${verificationToken}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify Your Crackin AI Account',
      html: `<p>Welcome to Crackin AI! Click <a href="${verificationLink}">here</a> to verify your email address.</p>`
    });

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account."
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// GET: Verify Email
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.redirect('http://localhost:5173/');
  } catch (error) {
    console.error("Verification Route Error:", error);
    res.status(500).json({ message: "Server error during verification." });
  }
});

// POST: Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +loginAttempts +lockUntil");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(429).json({ message: "Account locked. Try again later" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
      }
      await user.save();
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST: Check if email exists
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ available: false });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    res.json({ available: !user });

  } catch (error) {
    res.status(500).json({ available: false });
  }
});

// POST: Google Sign-In
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "ID token required" });
    }

    console.log("Verifying ID token with Firebase...");
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { email, name } = decodedToken;

    console.log("Token verified for:", email);

    let user = await User.findOne({ email });

    if (!user) {
      console.log("Creating new user for:", email);
      user = new User({
        name: name || "User",
        email,
        provider: "google",
        isVerified: true
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    console.log("✅ Google Sign-In successful for:", email);

    res.json({
      message: "Google sign-in successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("❌ Google Sign-In Error:", error.message);
    res.status(500).json({ message: "Google sign-in failed: " + error.message });
  }
});

module.exports = router;