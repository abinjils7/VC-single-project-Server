import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: { // "Your pitch has been accepted by Investor Name"
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["pitch_status", "system", "message"],
            default: "pitch_status",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        relatedId: { // e.g., pitchId
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
