import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/Db";
import cookieParser from "cookie-parser";

dotenv.config();

// DB connection
connectDB();

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

import authRoutes from "./Routes/AuthRoutes";
import postroutes from "./Routes/PostRoutes";
import userRoutes from "./Routes/UserRoutes";
import otpRoutes from "./Routes/OtpRoutes";

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running loooooo");
});

import "./config/Passport";
import passport from "passport";
app.use(passport.initialize());

import pitchRoutes from "./Routes/PitchRoutes";
import googleRoutes from "./Routes/googleRoutes";

app.use("/uploads", express.static("uploads"));
app.use("/auth/google", googleRoutes);
app.use("/auth", authRoutes);
app.use("/post", postroutes);
app.use("/user", userRoutes);
app.use("/otp", otpRoutes);
app.use("/pitch", pitchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
