import express from "express";
import { getUserNotifications, markAsRead, markAllAsRead } from "../Controllers/NotificationController";
import { authMiddleware } from "../Middlewares/authMiddleware";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getUserNotifications as any);
router.put("/:notificationId/read", markAsRead as any);
router.put("/read-all", markAllAsRead as any);

export default router;
