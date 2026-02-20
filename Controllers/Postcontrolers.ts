import Post from "../Models/Post";
import Report from "../Models/Report";
import mongoose from "mongoose";
import { Request, Response } from "express";

//  new post
//  new post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { authorId, postId, content } = req.body;
    const postImage = req.file ? req.file.path : null;

    console.log(req.body)

    const user = await User.findById(authorId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newPost = new Post({
      authorId,
      postId,
      content,
      postImage,
    });
    await newPost.save();

    console.log(newPost);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error });
  }
};


import User from "../Models/User";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { role, userId } = req.query;
    let filter: any = {};

    if (role) {
      const targetRole = role === "investor" ? "startup" : "investor";
      const users = await User.find({ role: { $in: [targetRole, "admin"] } }).select("_id");
      const userIds = users.map((u) => u._id);
      filter = { authorId: { $in: userIds } };
    }

    if (userId) {
      filter.authorId = userId;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find(filter)
      .populate({
        path: "authorId",
        select: "name role",
      })
      .populate({
        path: "comments.userId",
        select: "name avatar",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching posts",
      error,
    });
  }
};

// Like a post
export const likePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing userId" });
    }

    const post = await Post.findOneAndUpdate(
      { postId },
      { $addToSet: { likes: userId } },
      { new: true },
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    console.error("Error liking post:", error, { postId: req.params.postId, body: req.body });
    res.status(500).json({ message: "Error liking post", error });
  }
};

// Unlike a post
export const unlikePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing userId" });
    }

    const post = await Post.findOneAndUpdate(
      { postId },
      { $pull: { likes: userId } },
      { new: true },
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    console.error("Error unliking post:", error, { postId: req.params.postId, body: req.body });
    res.status(500).json({ message: "Error unliking post", error });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId, subject } = req.body;

    const post = await Post.findOneAndUpdate(
      { postId },
      { $push: { comments: { userId, subject } } },
      { new: true },
    ).populate("comments.userId");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
};


export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { postId, commentId } = req.params;

    console.log("on deletecomment", req.params);

    if (!commentId) {
      return res.status(400).json({ message: "Invalid commentId" });
    }

    const post = await Post.findOneAndUpdate(
      { postId },
      {
        $pull: {
          comments: { _id: new mongoose.Types.ObjectId(commentId as string) },
        },
      },
      { new: true },
    );

    if (!post) {
      return res.status(404).json({ message: "Post or comment not found" });
    }
    res.status(200).json({
      message: "Comment deleted successfully",
      post,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error deleting comment",
      error: error.message,
    });
  }
};

export const reportPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { reporterId, reason, description } = req.body;

    if (!reporterId) {
      return res.status(400).json({ message: "Reporter ID is required" });
    }

    // Verify post exists
    const post = await Post.findOne({ postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newReport = new Report({
      reporterId,
      postId,
      postObjectId: post._id,
      reason,
      description
    });

    await newReport.save();

    res.status(201).json({ message: "Report submitted successfully", report: newReport });
  } catch (error) {
    console.error("Error reporting post:", error);
    res.status(500).json({ message: "Error reporting post", error });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await Post.findOneAndDelete({ postId });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post", error: (error as Error).message });
  }
};
