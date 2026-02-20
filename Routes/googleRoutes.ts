import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const router = express.Router();

router.get("/", (req, res, next) => {
  const { userRole } = req.query;
  const role = userRole === "investor" ? "investor" : "startup";
  const state = Buffer.from(JSON.stringify({ role })).toString("base64");

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
  })(req, res, next);
});

router.get(
  "/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  async (req: Request, res: Response) => {
    try {
      const user: any = req.user;

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

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.redirect("https://your-vercel-app.vercel.app/home");
    } catch (error) {
      console.log(error);
     res.redirect("https://your-vercel-app.vercel.app/login?error=true");
    }
  },
);

export default router;
