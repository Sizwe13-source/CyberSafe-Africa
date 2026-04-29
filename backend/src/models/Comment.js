// src/models/Comment.js
import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    name:    { type: String, default: "Student", trim: true },
    body:    { type: String, required: true, trim: true, maxlength: 1000 },
    likes:   { type: Number, default: 0 },
    dislikes:{ type: Number, default: 0 },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    name:     { type: String, default: "Student", trim: true },
    body:     { type: String, required: true, trim: true, maxlength: 1000 },
    location: { type: String, default: "Media On Africa — Forum" },
    likes:    { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    replies:  [replySchema],
  },
  { timestamps: true }
);

commentSchema.index({ createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;