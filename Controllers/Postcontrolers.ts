import Post from "../Models/Post";
import mongoose from "mongoose";
import { Request, Response } from "express";

//  new post
//  new post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { authorId, postId, content } = req.body;
    const postImage = req.file ? req.file.path : null;

    const user = await User.findById(authorId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.pitchLimit <= 0) {
      return res.status(403).json({ message: "Limit exceeded coverage. Please upgrade your plan." });
    }

    const newPost = new Post({
      authorId,
      postId,
      content,
      postImage,
    });
    await newPost.save();

    user.pitchLimit -= 1;
    await user.save();

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
      const users = await User.find({ role: targetRole }).select("_id");
      const userIds = users.map((u) => u._id);
      filter = { authorId: { $in: userIds } };
    }

    if (userId) {
      filter.authorId = userId;
    }

    const posts = await Post.find(filter)
      .populate({
        path: "authorId",
        select: "name role",
      })
      .populate({
        path: "comments.userId",
        select: "name avatar",
      })
      .sort({ createdAt: -1 }); // 🔥 newest first

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
