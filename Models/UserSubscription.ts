import mongoose from "mongoose";

const userSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    subscriptionId: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

const UserSubscription = mongoose.model(
  "UserSubscription",
  userSubscriptionSchema,
);

export default UserSubscription;
