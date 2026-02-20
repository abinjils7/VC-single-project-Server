import mongoose, { Document, Model, Schema } from "mongoose";

// ==========================================
// SystemSettings Model
// ==========================================
// This is a "singleton" model — only ONE document exists in the collection.
// It stores global app settings like maintenance mode.

export interface ISystemSettings extends Document {
  maintenanceMode: boolean;
}

const systemSettingsSchema = new Schema(
  {
    // When true, non-admin users are blocked from accessing the app
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const SystemSettings: Model<ISystemSettings> = mongoose.model<ISystemSettings>(
  "SystemSettings",
  systemSettingsSchema
);

export default SystemSettings;
