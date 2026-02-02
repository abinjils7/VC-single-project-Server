import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Free | Basic | Pro
    },

    role: {
      type: String,
      required: true, // startup | investor
    },

    price: {
      type: Number,
      required: true,
    },

    durationInDays: {
      type: Number,
      required: true,
    },

    pitchLimit: {
      type: Number,
      required: true,
    },

    canSendPitch: {
      type: Boolean,
      required: true,
    },

    canViewProfiles: {
      type: Boolean,
      required: true,
    },

    canChat: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
