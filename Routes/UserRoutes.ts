import express from "express";
import { authMiddleware } from "../Middlewares/authMiddleware";
import { getUser, deleteUser, updateUser } from "../Controllers/UserController";

const router = express.Router();

router.get("/", authMiddleware, getUser);
router.put("/update", authMiddleware, updateUser);
router.delete("/delete", authMiddleware, deleteUser);

export default router;
