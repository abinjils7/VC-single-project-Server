import { Request, Response } from "express";
import User from "../Models/User";

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
