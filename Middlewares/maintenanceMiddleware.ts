import { Request, Response, NextFunction } from "express";
import SystemSettings from "../Models/SystemSettings";



export const maintenanceMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Fetch the settings document from the database
        const settings = await SystemSettings.findOne();

        // If no settings document exists yet, or maintenance is OFF → allow request
        if (!settings || !settings.maintenanceMode) {
            return next();
        }

        if (req.user && req.user.role === "admin") {
            // Admins can still access everything
            return next();
        }


        return res.status(503).json({ message: "Server under maintenance" });
    } catch (error) {
        // If something goes wrong reading settings, don't block the request
        console.error("Error in maintenance middleware:", error);
        return next();
    }
};
