import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email?: string;
  role?: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // console.log(" received on auth ", req.cookies);

  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET as string,
    ) as JwtPayload;

    req.user = decoded;

    // console.log("forwarding to the next middleware the req.user", decoded);

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
