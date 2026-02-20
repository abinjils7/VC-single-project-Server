import express from "express";
import Razorpay from "razorpay";

import User from "../Models/User";
import { authMiddleware } from "../Middlewares/authMiddleware";

const PLANS: Record<string, { pitchLimit: number }> = {
  silver: { pitchLimit: 10 },
  platinum: { pitchLimit: 20 },
  gold: { pitchLimit: 99 },
};

const router = express.Router();
import crypto from "crypto";
// Apply authMiddleware to all routes
router.use(authMiddleware);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
    console.log("Create Order Request Body:", req.body);
    const { amount, planId } = req.body;

    if (!amount || !planId) {
      console.error("Missing amount or planId");
      return res.status(400).json({ error: "Missing amount or planId" });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${planId}_${Date.now()}`,
    };
    console.log("Razorpay Order Options:", options);

    const order = await razorpay.orders.create(options);
    console.log("Razorpay Order Created:", order);

    res.json(order);
  } catch (err: any) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

import fs from "fs";
import path from "path";

const logFile = path.join(__dirname, "../../payment_debug.log");

function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = req.body;

    logToFile(`Verify Payment Request: ${JSON.stringify(req.body)}`);
    logToFile(
      `RAZORPAY_KEY_SECRET exists: ${!!process.env.RAZORPAY_KEY_SECRET}`,
    );

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    logToFile(`Expected Signature: ${expectedSignature}`);
    logToFile(`Received Signature: ${razorpay_signature}`);

    if (expectedSignature === razorpay_signature) {
      console.log("Signature Verified Successfully");
      logToFile("Signature Verified Successfully");

      const userId = req.user?.id;
      const plan = PLANS[planId];

      if (userId && plan) {
        await User.findByIdAndUpdate(userId, {
          $set: {
            pitchLimit: plan.pitchLimit,
            isPremium: true,
            subscriptionExpireDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ),
          },
        });
        console.log(
          `User ${userId} upgraded to ${planId} with limit ${plan.pitchLimit}`,
        );
        logToFile(`User ${userId} upgraded`);
      }

      res.json({
        success: true,
        message: "Payment verified",
      });
    } else {
      //   console.error("Invalid signature");
      //   console.log("Expected:", expectedSignature);
      //   console.log("Received:", razorpay_signature);
      //   console.log("Generated Body:", body);

      logToFile("Invalid signature");
      logToFile(`Expected: ${expectedSignature}`);
      logToFile(`Received: ${razorpay_signature}`);

      res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (err: any) {
    console.error("Payment verification error:", err);
    logToFile(`Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

export default router;
