require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const admin = require("firebase-admin"); // Updated: Standard import to fix admin.auth() error
const seedDatabase = require("./seed");

const app = express();
const server = http.createServer(app);

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO SETUP
// ═══════════════════════════════════════════════════════════════
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "https://placeai-sqjj.onrender.com"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Import WebSocket handlers
const {
  registerUserConnection,
  unregisterUserConnection,
  handleProblemSolved,
  handleInterviewCompleted,
  handleResumeUpdated,
  handleQuizAttempted,
} = require("./utils/websocket-handler");

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════
io.on("connection", (socket) => {
  console.log(`🔌 New WebSocket connection: ${socket.id}`);

  // User joins their personal room
  socket.on("joinDashboard", (userId) => {
    console.log(`📍 User ${userId} joined dashboard room`);
    socket.join(`user-${userId}`);
    registerUserConnection(userId, socket);
  });

  // Problem solved event
  socket.on("problemSolved", async (data) => {
    const { userId, problemId, details } = data;
    console.log(`✅ Problem solved - User: ${userId}, Problem: ${problemId}`);
    await handleProblemSolved(userId, problemId, details);
  });

  // Interview completed event
  socket.on("interviewCompleted", async (data) => {
    const { userId, interviewId, score } = data;
    console.log(`🎤 Interview completed - User: ${userId}, Score: ${score}`);
    await handleInterviewCompleted(userId, interviewId, score);
  });

  // Resume updated event
  socket.on("resumeUpdated", async (data) => {
    const { userId, score } = data;
    console.log(`📄 Resume updated - User: ${userId}, Score: ${score}`);
    await handleResumeUpdated(userId, score);
  });

  // Quiz attempted event
  socket.on("quizAttempted", async (data) => {
    const { userId, score } = data;
    console.log(`📝 Quiz attempted - User: ${userId}, Score: ${score}`);
    await handleQuizAttempted(userId, score);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ WebSocket disconnected: ${socket.id}`);
  });
});

// ═══════════════════════════════════════════════════════════════
// EXPRESS MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "https://placeai-sqjj.onrender.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Security Headers for popup communication
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// ═══════════════════════════════════════════════════════════════
// FIREBASE INITIALIZATION
// ═══════════════════════════════════════════════════════════════
const { initializeApp, cert, getApps } = require("firebase-admin/app");

try {
  if (!process.env.FIREBASE_CREDENTIALS) {
    throw new Error("FIREBASE_CREDENTIALS is missing from .env file");
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  
  // Safely fix the private key formatting
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  console.log("Service account loaded, project_id:", serviceAccount.project_id);
  
  // Only initialize if it hasn't been initialized yet
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
  
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.error("❌ Firebase init error:", error.message);
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════
app.get('/api/ping', (req, res) => res.status(200).send('awake'));
app.use("/api/auth", require("./routes/auth"));

// Protected routes
app.use("/api/problems", require("./routes/problems"));
app.use("/api/resume", require("./routes/resume"));
app.use("/api/interview", require("./routes/interview"));
app.use("/api/quiz", require("./routes/quiz"));
app.use("/api/company", require("./routes/company"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/daily", require("./routes/daily"));
app.use("/api/chatbot", require("./routes/chatbot"));

// ═══════════════════════════════════════════════════════════════
// MONGODB CONNECTION
// ═══════════════════════════════════════════════════════════════
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedDatabase();
  })
  .catch((err) => console.log("❌ DB Error:", err));

// ═══════════════════════════════════════════════════════════════
// SERVER START
// ═══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
});

// Export io for use in other modules if needed
module.exports = { app, server, io };