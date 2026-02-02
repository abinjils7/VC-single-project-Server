import { Request, Response } from "express";
import Otp from "../Models/otp";
import { sendOtpEmail } from "../Services/Email";
import User from "../Models/User";


export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "no users found" });
    }

    const otp = await sendOtpEmail(email);

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};

//  ---------------- VERIFY OTP ----------------

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: " OTP  required" });
    }

    const record = await Otp.findOne({ otp });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Remove otp from db
    await Otp.deleteMany({ otp });

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "OTP verification failed",
    });
  }
};
