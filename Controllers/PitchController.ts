import { Request, Response } from "express";
import Pitch from "../Models/Pitch";
import User from "../Models/User";
import Chat from "../Models/Chat";
import Notification from "../Models/Notification";

export const createPitch = async (req: Request, res: Response) => {
    try {
        const { fromUserId, toUserId, message } = req.body;

        const user = await User.findById(fromUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === "startup") {
            if (user.pitchLimit <= 0) {
                return res.status(403).json({ message: "Pitch limit exceeded. Please upgrade your plan." });
            }
        }

        if (!req.file) {
            return res.status(400).json({ message: "No video file uploaded" });
        }

        const pitchVideoUrl = req.file.path.replace(/\\/g, "/"); // Normalize path for Windows

        const newPitch = new Pitch({
            fromUserId,
            toUserId,
            message,
            pitchVideoUrl,
            postId: req.body.postId,
        });

        await newPitch.save();

        // Decrement pitchLimit for startup
        if (user.role === "startup") {
            user.pitchLimit -= 1;
            await user.save();
        }

        res.status(201).json(newPitch);
    } catch (error) {
        console.error("Error creating pitch:", error);
        res.status(500).json({ message: "Error creating pitch", error });
    }
};

export const getPitchesForInvestor = async (req: Request, res: Response) => {
    try {
        const { investorId } = req.params;
        const pitches = await Pitch.find({ toUserId: investorId })
            .populate("fromUserId", "name avatar displayName email category1 stage description")
            .sort({ createdAt: -1 });
        res.status(200).json(pitches);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pitches", error });
    }
};

export const updatePitchStatus = async (req: Request, res: Response) => {
    try {
        const { pitchId } = req.params;
        const { status } = req.body; // "accepted" | "rejected"

        if (!["accepted", "rejected", "pending"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const pitch = await Pitch.findById(pitchId);
        if (!pitch) {
            return res.status(404).json({ message: "Pitch not found" });
        }

        // Logic for Accepted - Check limits for Investor
        if (status === "accepted") {
            const investor = await User.findById(pitch.toUserId);
            if (!investor) {
                return res.status(404).json({ message: "Investor not found" });
            }

            if (investor.pitchLimit <= 0) {
                return res.status(403).json({ message: "Pitch limit exceeded. Please upgrade your plan." });
            }

            // Decrement usage
            investor.pitchLimit -= 1;
            await investor.save();
        }

        const updatedPitch = await Pitch.findByIdAndUpdate(
            pitchId,
            { status },
            { new: true }
        ).populate("toUserId", "name") as any;

        if (!updatedPitch) {
            return res.status(404).json({ message: "Pitch not found" });
        }

        // Logic for Accepted/Rejected
        if (status === "accepted") {
            // 1. Check/Create Chat
            const existingChat = await Chat.findOne({
                participants: { $all: [updatedPitch.fromUserId, updatedPitch.toUserId] }
            });

            if (!existingChat) {
                await Chat.create({
                    participants: [updatedPitch.fromUserId, updatedPitch.toUserId],
                    lastMessage: "Pitch Accepted! Start chatting.",
                    lastMessageTime: new Date()
                });
            }

            // 2. Notify Startup
            await Notification.create({
                userId: updatedPitch.fromUserId,
                message: `Your pitch was ACCEPTED by ${(updatedPitch.toUserId as any).name}! A chat has been started.`,
                type: "pitch_status",
                relatedId: updatedPitch._id as string
            });

        } else if (status === "rejected") {
            // Notify Startup
            await Notification.create({
                userId: updatedPitch.fromUserId,
                message: `Your pitch was REJECTED by ${(updatedPitch.toUserId as any).name}.`,
                type: "pitch_status",
                relatedId: updatedPitch._id as string
            });
        }

        res.status(200).json(updatedPitch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating pitch status", error });
    }
};

export const getStartupPitches = async (req: Request, res: Response) => {
    try {
        const { startupId } = req.params;
        const pitches = await Pitch.find({ fromUserId: startupId })
            .populate("toUserId", "name avatar displayName email category1")
            .sort({ createdAt: -1 });
        res.status(200).json(pitches);
    } catch (error) {
        res.status(500).json({ message: "Error fetching startup pitches", error });
    }
};
