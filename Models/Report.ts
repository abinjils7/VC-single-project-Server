import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        reporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        postId: {
            type: String, // Referencing the 'postId' field in Post model (String UUID)
            required: true,
        },
        postObjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: false
        },
        reason: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "dismissed", "action_taken"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
