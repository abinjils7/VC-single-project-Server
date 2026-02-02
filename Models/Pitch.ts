import mongoose from "mongoose";

const pitchSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pitchVideoUrl: {
      type: String,
      required: true,
    },

    postId: {
      type: String,
      required: false,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      required: true,
      default: "pending", // pending | accepted | rejected
    },
  },
  { timestamps: true }
);
export default mongoose.model("Pitch", pitchSchema);
