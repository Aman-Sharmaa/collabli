import mongoose, { Schema, type Document, type Model } from "mongoose";

export type CollabliNotificationType =
  | "application"
  | "deal_status"
  | "payment"
  | "message"
  | "deadline"
  | "dispute";

export interface ICollabliNotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  type: CollabliNotificationType;
  read: boolean;
  dealId?: mongoose.Types.ObjectId;
}

const CollabliNotificationSchema = new Schema<ICollabliNotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: {
    type: String,
    enum: ["application", "deal_status", "payment", "message", "deadline", "dispute"],
    required: true,
  },
  read: { type: Boolean, default: false },
  dealId: { type: Schema.Types.ObjectId, ref: "Deal" },
}, { timestamps: true });

export const CollabliNotification: Model<ICollabliNotification> = mongoose.models.CollabliNotification || mongoose.model<ICollabliNotification>("CollabliNotification", CollabliNotificationSchema);
