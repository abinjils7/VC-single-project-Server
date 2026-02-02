import express from "express";
import { sendOtp, verifyOtp } from "../Controllers/OtpController";

const router = express.Router();

router.post("/send", sendOtp);
router.post("/verify", verifyOtp);

export default router;
