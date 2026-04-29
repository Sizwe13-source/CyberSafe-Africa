// server.js
import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";

import connectDB from "./src/config/db.js";
import activityRoutes from "./src/routes/activityRoutes.js";
import incidentRoutes from "./src/routes/incidentRoutes.js";
import adminRoutes   from "./src/routes/adminRoutes.js";
import aiRoutes      from "./src/routes/aiRoutes.js";

const app = express();

/* ===============================
   🌍 CORS
================================ */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5500",
  "https://cyber-safe-africa.vercel.app",
  "https://media-on-africa-learning-hub-main.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  })
);

/* ===============================
   🔧 MIDDLEWARE
================================ */
app.use(express.json({ limit: "10kb" }));        // reject oversized payloads
app.use(express.urlencoded({ extended: true }));

/* ===============================
   🔒 RATE LIMITING
   Separate limits for AI routes
   (expensive) vs everything else.
================================ */
const defaultLimiter = rateLimit({
  windowMs:          15 * 60 * 1000,  // 15 min
  max:               100,
  standardHeaders:   true,            // sends RateLimit-* headers to client
  legacyHeaders:     false,
  message:           { success: false, message: "Too many requests, please try again later." },
});

const aiLimiter = rateLimit({
  windowMs:          15 * 60 * 1000,
  max:               30,              // AI calls cost money — keep this tight
  standardHeaders:   true,
  legacyHeaders:     false,
  message:           { success: false, message: "AI rate limit reached, please wait." },
});

app.use("/api/ai",       aiLimiter);
app.use(defaultLimiter);

/* ===============================
   🌐 HTTP + SOCKET.IO
================================ */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:  allowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

app.set("io", io);

/* ===============================
   🔥 HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "CyberSafe Africa API is running." });
});

app.get("/api/health", async (req, res) => {
  const dbState = ["disconnected", "connected", "connecting", "disconnecting"];
  const mongoose = (await import("mongoose")).default;

  res.json({
    status: "OK",
    message: "CyberSafe backend running",
    ai: process.env.OPENAI_API_KEY ? "connected" : "missing",
    database: dbState[mongoose.connection.readyState] ?? "unknown",
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

/* ===============================
   🔗 ROUTES
================================ */
app.use("/api/activity",  activityRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/admin",     adminRoutes);
app.use("/api/ai",        aiRoutes);

/* ===============================
   ❓ 404 — unknown routes
================================ */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

/* ===============================
   🔥 GLOBAL ERROR HANDLER
   Must be last and have 4 params.
================================ */
app.use((err, req, res, next) => {  // eslint-disable-line no-unused-vars
  console.error("🔥 Unhandled error:", err.message);

  // CORS errors surface here — give a clearer response
  if (err.message?.startsWith("CORS")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* ===============================
   🚀 START
================================ */
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔑 OpenAI: ${process.env.OPENAI_API_KEY ? "connected" : "⚠️  missing"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

/* ===============================
   🛑 GRACEFUL SHUTDOWN
   Closes DB + socket connections
   cleanly on Ctrl+C or deploy.
================================ */
const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  server.close(async () => {
    const mongoose = (await import("mongoose")).default;
    await mongoose.connection.close();
    console.log("✅ Server and DB closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err.message);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err.message);
  process.exit(1);   // uncaughtException leaves the process in undefined state — must exit
});