import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  googleId?: string;
  avatar?: string;
  password?: string;
  role: "startup" | "investor" | "admin";
  displayName: string;
  description: string;
  category1: string;
  category2: string;
  stage?: string;
  tokenValue?: string;
  isPremium: boolean;
  subscriptionExpireDate?: Date;
  pitchLimit: number;

  isBlocked: boolean;
  hasUsedFreeTrial?: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      unique: true,
    },
    googleId: {
      type: String,
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
    },

    role: {
      type: String,
      enum: ["startup", "investor", "admin"],
      required: true,
    },

    displayName: { type: String, required: true },
    description: { type: String, required: true },

    category1: { type: String, required: true },
    category2: { type: String, required: true },

    stage: {
      type: String,
      required: function (this: any) {
        return this.role === "startup";
      },
    },
    tokenValue: {
      type: String,
      default: null,
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    subscriptionExpireDate: {
      type: Date,
      default: null,
    },

    pitchLimit: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      default: null,
    },
    hasUsedFreeTrial: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
