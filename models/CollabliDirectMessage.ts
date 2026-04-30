import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICollabliDirectMessage extends Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  body: string;
  read: boolean;
}

const CollabliDirectMessageSchema = new Schema<ICollabliDirectMessage>(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CollabliDirectMessageSchema.index({ fromUserId: 1, toUserId: 1, createdAt: -1 });
CollabliDirectMessageSchema.index({ toUserId: 1, read: 1 });

export const CollabliDirectMessage: Model<ICollabliDirectMessage> =
  mongoose.models.CollabliDirectMessage ||
  mongoose.model<ICollabliDirectMessage>("CollabliDirectMessage", CollabliDirectMessageSchema);
