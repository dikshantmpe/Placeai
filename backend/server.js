require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const seedDatabase = require("./seed");
const { initializeApp, cert } = require("firebase-admin/app");

const app = express();
const server = http.createServer(app);
const dsaRouter = require("./routes/dsa");

// ═══════════════════════════════════════════════════════════════
// MULTER SETUP (File upload handling)
// ═══════════════════════════════════════════════════════════════
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    // Accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// EXPRESS MIDDLEWARE (FIRST - before anything else)
// ═══════════════════════════════════════════════════════════════
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "https://placeai-sqjj.onrender.com", "https://placeai-mu.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Security Headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO SETUP (Optional - with error handling)
// ═══════════════════════════════════════════════════════════════
let wsHandler = null;
try {
  const io = socketIo(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000", "https://placeai-sqjj.onrender.com", "https://placeai-mu.vercel.app"],
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // Try to load websocket handler
  try {
    wsHandler = require("./utils/websocket-handler");
    console.log("✅ WebSocket handler loaded");
  } catch (err) {
    console.warn("⚠️ WebSocket handler not available:", err.message);
  }

  io.on("connection", (socket) => {
    console.log(`🔌 WebSocket connection: ${socket.id}`);

    socket.on("joinDashboard", (userId) => {
      console.log(`📍 User ${userId} joined dashboard`);
      socket.join(`user-${userId}`);
      if (wsHandler?.registerUserConnection) {
        wsHandler.registerUserConnection(userId, socket);
      }
    });

    socket.on("problemSolved", async (data) => {
      if (wsHandler?.handleProblemSolved) {
        await wsHandler.handleProblemSolved(data.userId, data.problemId, data.details);
      }
    });

    socket.on("interviewCompleted", async (data) => {
      if (wsHandler?.handleInterviewCompleted) {
        await wsHandler.handleInterviewCompleted(data.userId, data.interviewId, data.score);
      }
    });

    socket.on("resumeUpdated", async (data) => {
      if (wsHandler?.handleResumeUpdated) {
        await wsHandler.handleResumeUpdated(data.userId, data.score);
      }
    });

    socket.on("quizAttempted", async (data) => {
      if (wsHandler?.handleQuizAttempted) {
        await wsHandler.handleQuizAttempted(data.userId, data.score);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ WebSocket disconnected: ${socket.id}`);
    });
  });

  console.log("✅ WebSocket initialized");
} catch (err) {
  console.warn("⚠️ WebSocket initialization warning:", err.message);
}

// ═══════════════════════════════════════════════════════════════
// FIREBASE INITIALIZATION
// ═══════════════════════════════════════════════════════════════
try {
  let firebaseConfig;
  
  if (process.env.FIREBASE_CREDENTIALS) {
    console.log("Using FIREBASE_CREDENTIALS (combined JSON)");
    firebaseConfig = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    console.log("Using individual Firebase environment variables");
    firebaseConfig = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "key-id",
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || "client-id",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase@appspot.gserviceaccount.com"
    };
  } else {
    throw new Error("Firebase credentials not found in environment");
  }

  console.log("Service account loaded, project_id:", firebaseConfig.project_id);
  initializeApp({
    credential: cert(firebaseConfig)
  });
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error.message);
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK ENDPOINTS (no auth required)
// ═══════════════════════════════════════════════════════════════
app.get('/api/ping', (req, res) => {
  console.log("✅ Ping endpoint hit");
  res.status(200).json({ status: 'awake', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ═══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
const authMiddleware = require("./middleware/auth");

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════
app.use("/api/auth", require("./routes/auth"));

// Protected routes
app.use("/api/problems", require("./routes/problems"));
app.use("/api/interview", require("./routes/interview"));
app.use("/api/quiz", require("./routes/quiz"));
app.use("/api/company", require("./routes/company"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/daily", require("./routes/daily"));
app.use("/api/chatbot", require("./routes/chatbot"));

// ✅ DSA routes with auth middleware
app.use("/api/dsa", authMiddleware, dsaRouter);

// ✅ Resume routes with auth middleware + multer for PDF uploads
app.use("/api/resume", authMiddleware, upload.single("resume"), require("./routes/resume"));

// ═══════════════════════════════════════════════════════════════
// MONGODB CONNECTION
// ═══════════════════════════════════════════════════════════════
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log("✅ MongoDB connected");
    try {
      await seedDatabase();
    } catch (err) {
      console.warn("⚠️ Seed database warning:", err.message);
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ 
        error: "File too large. Maximum size is 10 MB." 
      });
    }
    return res.status(400).json({ 
      error: `Upload error: ${err.message}` 
    });
  }
  
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ 
      error: "Only PDF files are allowed." 
    });
  }

  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ═══════════════════════════════════════════════════════════════
// SERVER START
// ═══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready`);
  console.log(`🏥 Health check: /api/health`);
  console.log(`🔔 Ping: /api/ping`);
  console.log(`📄 Resume upload: /api/resume/analyze (requires auth + PDF file)`);
});

module.exports = { app, server };