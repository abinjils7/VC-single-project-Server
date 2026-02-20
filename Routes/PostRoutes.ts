import express from "express";
import {
  createPost,
  getPosts,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  reportPost,
  deletePost,
} from "../Controllers/Postcontrolers";

import upload from "../Middlewares/uploadMiddleware";

const router = express.Router();

router.post("/newpost", upload.single("image"), createPost);
router.get("/getpost", getPosts);
router.put("/:postId/like", likePost);
router.put("/:postId/unlike", unlikePost);
router.post("/:postId/comment", addComment);
router.delete("/:postId/comment/:commentId", deleteComment);
router.post("/:postId/report", reportPost);
router.delete("/:postId", deletePost);

export default router;
