import { Request, Response } from "express";
import User from "../Models/User";
import PostModel from "../Models/Post";
import PitchModel from "../Models/Pitch";
import MessageModel from "../Models/Messege";
import ChatModel from "../Models/Chat";
import NotificationModel from "../Models/Notification";

export const getUser = async (req: Request, res: Response) => {
  try {
    // console.log("req.user comes from auth middleware", req.user);
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.user;

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      console.log("[UserController] User not found, returning 404");
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching user",
      error,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.user as any;

    await User.findByIdAndDelete(id);

    try {
      await PostModel.deleteMany({ authorId: id });

      await PostModel.updateMany({}, { $pull: { likes: id } });
      await PostModel.updateMany({}, { $pull: { comments: { userId: id } } });

      await PitchModel.deleteMany({
        $or: [{ fromUserId: id }, { toUserId: id }],
      });

      await ChatModel.deleteMany({ participants: id });

      await MessageModel.deleteMany({ senderId: id.toString() });

      await NotificationModel.deleteMany({ userId: id });
    } catch (cleanupError) {
      console.error("Error during user deletion cleanup:", cleanupError);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res
      .status(200)
      .json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ message: "Error deleting user", error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.user as any;

    const allowedFields = [
      "displayName",
      "description",
      "email",
      "category1",
      "category2",
      "stage",
      "tokenValue",
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password -refreshToken");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ message: "Error updating user", error });
  }
};
