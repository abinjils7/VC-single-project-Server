import express from "express";
import {
  login,
  register,
  changePassword,
  resetPassword,
  getMe,
  subscribe,
  logout,
  refreshToken,
} from "../Controllers/Authcontrollers";
import { authMiddleware } from "../Middlewares/authMiddleware";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/changepassword", changePassword);
router.post("/resetPassword", resetPassword);
router.get("/me", authMiddleware, getMe);
router.post("/subscribe", authMiddleware, subscribe);
router.post("/logout", logout);
router.post("/refresh", refreshToken);

export default router;
