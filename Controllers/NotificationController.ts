import { Request, Response } from "express";
import Notification from "../Models/Notification";

// Get notifications for the logged-in user
export const getUserNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user._id;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(30);

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Error fetching notifications", error });
    }
};

// Mark a single notification as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { notificationId } = req.params;

        await Notification.findByIdAndUpdate(notificationId, { isRead: true });

        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error marking notification", error });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user._id;

        await Notification.updateMany({ userId, isRead: false }, { isRead: true });

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error marking notifications", error });
    }
};
