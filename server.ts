import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/Db.js";
import cookieParser from "cookie-parser";

dotenv.config();

// DB connection
connectDB();

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: "https://vc-single-project-client-git-main-abinjils7s-projects.vercel.app",
    credentials: true,
  }),
);

import authRoutes from "./Routes/AuthRoutes";
import postroutes from "./Routes/PostRoutes";
import userRoutes from "./Routes/UserRoutes";
import otpRoutes from "./Routes/OtpRoutes";

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running ");
});

import "./config/Passport";
import passport from "passport";
app.use(passport.initialize());

import pitchRoutes from "./Routes/PitchRoutes";
import googleRoutes from "./Routes/googleRoutes";
import adminRoutes from "./Routes/AdminRoutes";
import chatRoutes from "./Routes/ChatRoutes";
import notificationRoutes from "./Routes/NotificationRoutes";

app.use("/uploads", express.static("uploads"));


// Auth routes — so users can still log in/out
app.use("/auth/google", googleRoutes);
app.use("/auth", authRoutes);



import SystemSettings from "./Models/SystemSettings";

app.get("/api/maintenance-status", async (req: Request, res: Response) => {
  try {
    const settings = await SystemSettings.findOne();
    res.json({ maintenanceMode: settings ? settings.maintenanceMode : false });
  } catch {
    res.json({ maintenanceMode: false });
  }
});

// Admin routes — so admins can toggle maintenance OFF
app.use("/admin", adminRoutes);

// Applied globally AFTER auth/admin routes but BEFORE all other routes.
// When maintenance mode is ON, non-admin users get a 503 response.
import { maintenanceMiddleware } from "./Middlewares/maintenanceMiddleware";
app.use(maintenanceMiddleware);


app.use("/post", postroutes);
app.use("/user", userRoutes);
app.use("/otp", otpRoutes);
app.use("/pitch", pitchRoutes);
app.use("/chat", chatRoutes);
app.use("/notifications", notificationRoutes);

import paymentRoutes from "./Routes/Payment Routes";
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});


import { registerSocketHandlers } from "./Controllers/SocketController";

registerSocketHandlers(io);


export { io };

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
