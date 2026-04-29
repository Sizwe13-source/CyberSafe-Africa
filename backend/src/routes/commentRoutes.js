// src/routes/commentRoutes.js
import express from "express";
import {
  createComment,
  getComments,
  likeComment,
  dislikeComment,
  addReply,
  likeReply,
  dislikeReply,
} from "../controllers/commentController.js";

const router = express.Router();

router.get("/",                                       getComments);
router.post("/",                                      createComment);
router.patch("/:id/like",                             likeComment);
router.patch("/:id/dislike",                          dislikeComment);
router.post("/:id/replies",                           addReply);
router.patch("/:id/replies/:replyId/like",            likeReply);
router.patch("/:id/replies/:replyId/dislike",         dislikeReply);

export default router;