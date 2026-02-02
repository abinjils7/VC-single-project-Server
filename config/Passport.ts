import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import passport from "passport";
import User from "../Models/User";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "/auth/google/callback",
    },
    async (accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback) => {
      try {
        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return cb(null, user);
        }

        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          displayName: profile.displayName,
          email: profile.emails?.[0].value,
          avatar: profile.photos?.[0].value,
          role: "startup",
          description: "Signed up via Google",
          category1: "General",
          category2: "General",
          stage: "Idea",
        });

        return cb(null, user);
      } catch (error) {
        return cb(error as any, false);
      }
    },
  ),
);

// Serialize/Deserialize user (optional if using sessions, but good practice)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
