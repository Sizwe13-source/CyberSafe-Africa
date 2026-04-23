import dotenv from "dotenv";
dotenv.config(); // 🔥 MUST BE FIRST

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";

import connectDB from "./src/config/db.js";

import activityRoutes from "./src/routes/activityRoutes.js";
import incidentRoutes from "./src/routes/incidentRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";

const app = express();

/* ===============================
   🔒 SECURITY: RATE LIMITING
================================ */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});

app.use(limiter);

/* ===============================
   🔧 MIDDLEWARE
================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   🌍 CORS CONFIG
================================ */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5500", // 🔥 ADD THIS
  "https://cyber-safe-africa.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ===============================
   🌐 SERVER + SOCKET.IO
================================ */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Make socket available globally
app.set("io", io);

/* ===============================
   🔥 HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.status(200).send("CyberSafe Africa API is running...");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "CyberSafe backend running",
    ai: process.env.OPENAI_API_KEY ? "connected" : "missing",
    database: "connected"
  });
});

/* ===============================
   🔗 ROUTES
================================ */
app.use("/api/activity", activityRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes); // ✅ moved to correct place

/* ===============================
   🚀 START SERVER
================================ */
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

/* ===============================
   ⚠️ GLOBAL ERROR HANDLING
================================ */
process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err.message);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err.message);
});