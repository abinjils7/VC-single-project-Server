import express from "express";
import {
  getUserChats,
  getChatMessages,
  createMessage,
} from "../Controllers/ChatController";
import { authMiddleware } from "../Middlewares/authMiddleware";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", getUserChats as any);
router.get("/:chatId/messages", getChatMessages as any); //dont check type of getchat messege
router.post("/message", createMessage as any);

export default router;
