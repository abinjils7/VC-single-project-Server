import { Request, Response } from "express";
import User from "../Models/User";
import PostModel from "../Models/Post";
import PitchModel from "../Models/Pitch";
import Report from "../Models/Report";
import SystemSettings from "../Models/SystemSettings"; // <-- NEW: for maintenance mode

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStartups = await User.countDocuments({ role: "startup" });
        const totalInvestors = await User.countDocuments({ role: "investor" });
        const totalPosts = await PostModel.countDocuments();
        const totalPitches = await PitchModel.countDocuments();

        res.status(200).json({
            totalUsers,
            totalStartups,
            totalInvestors,
            totalPosts,
            totalPitches,
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Error fetching stats" });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
};

export const blockUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isBlocked = !user.isBlocked; // Toggle block status
        await user.save();

        res.status(200).json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user });
    } catch (error) {
        console.error("Error toggling user block status:", error);
        res.status(500).json({ message: "Error updating user status" });
    }
}

export const getReports = async (req: Request, res: Response) => {
    try {
        const reports = await Report.find()
            .populate({
                path: 'reporterId',
                select: 'name email role avatar'
            })
            .populate({
                path: 'postObjectId',
                populate: {
                    path: 'authorId',
                    select: 'name email role avatar'
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Error fetching reports" });
    }
};

export const dismissReport = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const report = await Report.findByIdAndUpdate(
            reportId,
            { status: 'dismissed' },
            { new: true }
        );
        if (!report) return res.status(404).json({ message: "Report not found" });

        res.status(200).json({ message: "Report dismissed", report });
    } catch (error) {
        console.error("Error dismissing report:", error);
        res.status(500).json({ message: "Error dismissing report" });
    }
};

export const deletePostFromReport = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { banUser } = req.body;

        const report = await Report.findById(reportId);
        if (!report) return res.status(404).json({ message: "Report not found" });

        // Delete the post
        if (report.postObjectId) {
            const post = await PostModel.findByIdAndDelete(report.postObjectId);

            // If requested, ban the author
            if (banUser && post) {
                await User.findByIdAndUpdate(post.authorId, { isBlocked: true });
            }
        }

        // Update report status
        report.status = 'action_taken';
        await report.save();

        res.status(200).json({ message: "Action taken successfully", report });
    } catch (error) {
        console.error("Error taking action on report:", error);
        res.status(500).json({ message: "Error processing report action" });
    }
};



export const toggleMaintenance = async (req: Request, res: Response) => {
    try {
        const { maintenanceMode } = req.body;

        // upsert: true → creates the document if it doesn't exist yet
        const settings = await SystemSettings.findOneAndUpdate(
            {},
            { maintenanceMode },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: `Maintenance mode ${maintenanceMode ? "enabled" : "disabled"}`,
            maintenanceMode: settings.maintenanceMode,
        });
    } catch (error) {
        console.error("Error toggling maintenance mode:", error);
        res.status(500).json({ message: "Error updating maintenance mode" });
    }
};


export const getMaintenanceStatus = async (req: Request, res: Response) => {
    try {
        const settings = await SystemSettings.findOne();
        res.status(200).json({
            maintenanceMode: settings ? settings.maintenanceMode : false,
        });
    } catch (error) {
        console.error("Error fetching maintenance status:", error);
        res.status(500).json({ message: "Error fetching maintenance status" });
    }
};

