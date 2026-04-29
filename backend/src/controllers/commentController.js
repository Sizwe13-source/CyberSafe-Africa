// src/controllers/commentController.js
import Comment  from "../models/Comment.js";
import Incident from "../models/Incident.js";

const BLOCK_AT  = 75;   // confidence % to hard-block
const API_URL   = process.env.CYBERSAFE_API || null; // internal — not needed, we call analyzeIncident directly

import { analyzeIncident } from "../utils/aiAnalysis.js";

/* ── helpers ── */
const isThreat = (threat) =>
  threat && threat.threatType !== "Safe" && Number(threat.confidence) >= BLOCK_AT;

/* ===============================
   POST /api/comments
   Scan + save a new comment
================================ */
export const createComment = async (req, res) => {
  try {
    const { name, body, location } = req.body;

    if (!body || body.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Comment body is required." });
    }

    // Run through CyberSafe AI
    const analysis = await analyzeIncident(body);
    const threat   = isThreat(analysis);

    // Always save the incident so dashboard sees it
    await Incident.create({
      name:        name || "Student",
      description: body,
      threatType:  analysis.threatType  || "Other",
      confidence:  Number(analysis.confidence) || 0,
      reason:      analysis.explanation || "",
      location:    location || "Media On Africa — Forum",
      status:      threat ? "pending" : "safe",
    });

    if (threat) {
      return res.status(200).json({
        success:  false,
        blocked:  true,
        threat: {
          type:       analysis.threatType,
          confidence: Number(analysis.confidence),
          reason:     analysis.explanation,
        },
      });
    }

    // Safe — save the comment
    const comment = await Comment.create({
      name:     name?.trim() || "Student",
      body:     body.trim(),
      location: location || "Media On Africa — Forum",
    });

    return res.status(201).json({ success: true, blocked: false, data: comment });

  } catch (error) {
    console.error("🔥 createComment error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   GET /api/comments
   Load all approved comments
================================ */
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ success: true, data: comments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   PATCH /api/comments/:id/like
   PATCH /api/comments/:id/dislike
================================ */
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    return res.json({ success: true, likes: comment.likes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const dislikeComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $inc: { dislikes: 1 } },
      { new: true }
    );
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    return res.json({ success: true, dislikes: comment.dislikes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   POST /api/comments/:id/replies
   Add a reply to a comment
================================ */
export const addReply = async (req, res) => {
  try {
    const { name, body } = req.body;

    if (!body || body.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Reply body is required." });
    }

    // Scan the reply too
    const analysis = await analyzeIncident(body);
    const threat   = isThreat(analysis);

    if (threat) {
      return res.status(200).json({
        success: false,
        blocked: true,
        threat: {
          type:       analysis.threatType,
          confidence: Number(analysis.confidence),
          reason:     analysis.explanation,
        },
      });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    comment.replies.push({
      name: name?.trim() || "Student",
      body: body.trim(),
    });

    await comment.save();

    const newReply = comment.replies[comment.replies.length - 1];
    return res.status(201).json({ success: true, blocked: false, data: newReply });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   PATCH /api/comments/:id/replies/:replyId/like
   PATCH /api/comments/:id/replies/:replyId/dislike
================================ */
export const likeReply = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: "Reply not found" });

    reply.likes += 1;
    await comment.save();
    return res.json({ success: true, likes: reply.likes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const dislikeReply = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: "Reply not found" });

    reply.dislikes += 1;
    await comment.save();
    return res.json({ success: true, dislikes: reply.dislikes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
