import User from "../Models/User";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import Messege from "../Models/Messege";

export const register = async function (req: Request, res: Response) {
  try {
    const userdata = req.body;

    // 1️ Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userdata.password, saltRounds);

    // 2️ Replace plain password
    userdata.password = hashedPassword;

    // 3️ Save user
    const user = new User(userdata);

    // Generate Tokens immediately
    const accessToken = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES as any },
    );

    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES as any },
    );

    user.refreshToken = refreshToken;
    await user.save();

    // Set Cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = user.toObject();
    // @ts-ignore
    delete userObj.password;
    // @ts-ignore
    delete userObj.refreshToken;

    res.status(201).json({
      message: "User registered and logged in successfully",
      user: userObj,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async function (req: Request, res: Response) {
  try {
    console.log(req.body, "from the login ");
    const { email, password } = req.body;

    const loggineduser = await User.findOne({ email });
    if (!loggineduser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (loggineduser.isBlocked) {
      return res
        .status(400)
        .json({ message: "youre blocked please contact the admin" });
    }
    if (!loggineduser.password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isvalid = await bcrypt.compare(password, loggineduser.password);
    if (!isvalid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      { id: loggineduser._id.toString(), role: loggineduser.role },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES as any },
    );

    const refreshToken = jwt.sign(
      { id: loggineduser._id.toString() },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES as any },
    );
    loggineduser.refreshToken = refreshToken;
    await loggineduser.save();
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userObj = loggineduser.toObject();
    // @ts-ignore
    delete userObj.password;
    // @ts-ignore
    delete userObj.refreshToken;

    res.status(200).json({
      message: "Logged in successfully",
      user: userObj,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const person = await User.findOne({ email });
    if (!person) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1️ Check current password
    if (!person.password) {
      return res.status(400).json({
        message: "User does not have a password set (e.g. Google login)",
      });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      person.password,
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const isSameAsOld = await bcrypt.compare(newPassword, person.password!);

    if (isSameAsOld) {
      return res.status(400).json({
        message: "New password must be different from old password",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    person.password = hashedPassword;
    await person.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newpassword } = req.body;

    if (!email || !newpassword) {
      return res.status(400).json({
        message: "Email and new password are required",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    // Check if new password is same as old password
    if (user.password) {
      const isSamePassword = await bcrypt.compare(newpassword, user.password);

      if (isSamePassword) {
        return res.status(400).json({
          message: "New password must be different from the old password",
        });
      }
    }
    const hashedPassword = await bcrypt.hash(newpassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error resetting password",
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const subscribe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { pitchLimit, isFreeTrial } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (isFreeTrial) {
      if (user.hasUsedFreeTrial) {
        return res.status(400).json({ message: "Free trial already used" });
      }
      // 7 days free trial
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 7);

      user.pitchLimit = (user.pitchLimit || 0) + 2;
      user.hasUsedFreeTrial = true;
      user.isPremium = true;
      user.subscriptionExpireDate = expireDate;

      await user.save();

      return res.status(200).json({
        message: "Free trial activated successfully",
        user,
      });
    }

    if (pitchLimit === undefined || pitchLimit === null) {
      return res.status(400).json({ message: "pitchLimit is required" });
    }

    // Calculate expiration date (30 days from now)
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 30);

    // Accumulate pitch limit instead of overwriting
    user.pitchLimit = (user.pitchLimit || 0) + Number(pitchLimit);
    user.isPremium = true;
    user.subscriptionExpireDate = expireDate;

    await user.save();

    res.status(200).json({
      message: "Subscription upgraded successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh Token is required" });
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as any;

    const user = await User.findById(payload.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES as any },
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};
