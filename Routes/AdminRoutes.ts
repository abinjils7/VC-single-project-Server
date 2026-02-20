import express from "express";
import { authMiddleware } from "../Middlewares/authMiddleware";
import { adminMiddleware } from "../Middlewares/adminMiddleware";
import {
    getDashboardStats,
    getAllUsers,
    blockUser,
    getReports,
    dismissReport,
    deletePostFromReport,
    toggleMaintenance,
    getMaintenanceStatus,
} from "../Controllers/AdminController";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.post("/block-user", blockUser);
router.get("/reports", getReports);
router.put("/reports/:reportId/dismiss", dismissReport);
router.post("/reports/:reportId/action", deletePostFromReport);

router.post("/maintenance", toggleMaintenance);
router.get("/maintenance-status", getMaintenanceStatus);

export default router;
