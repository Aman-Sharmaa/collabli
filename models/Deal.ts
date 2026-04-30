import mongoose, { Schema, type Document, type Model } from "mongoose";

export type DealStatus = "pending" | "active" | "submitted" | "completed";

export interface IDealMessage {
  senderId: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
}

export interface IContentProof {
  url: string;
  kind: "link" | "screenshot";
  note?: string;
  createdAt: Date;
}

export interface IDealDispute {
  raised: boolean;
  note?: string;
  raisedAt?: Date;
  raisedBy?: mongoose.Types.ObjectId;
}

export interface IDeal extends Document {
  campaignId: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  amount: number;
  status: DealStatus;
  escrowPaid: boolean;
  creatorPayoutReleased: boolean;
  commissionAmount: number;
  submittedContentUrl?: string;
  contentProofs: IContentProof[];
  messages: IDealMessage[];
  dispute: IDealDispute;
  deadlineReminderSentAt?: Date;
}

const MessageSchema = new Schema<IDealMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: true }
);

const ProofSchema = new Schema<IContentProof>(
  {
    url: { type: String, required: true },
    kind: { type: String, enum: ["link", "screenshot"], default: "link" },
    note: { type: String, default: "" },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: true }
);

const DisputeSchema = new Schema<IDealDispute>(
  {
    raised: { type: Boolean, default: false },
    note: { type: String, default: "" },
    raisedAt: { type: Date },
    raisedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const DealSchema = new Schema<IDeal>({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  brandId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: "CampaignApplication", required: true, unique: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "active", "submitted", "completed"], default: "pending" },
  escrowPaid: { type: Boolean, default: false },
  creatorPayoutReleased: { type: Boolean, default: false },
  commissionAmount: { type: Number, required: true },
  submittedContentUrl: { type: String, default: "" },
  contentProofs: { type: [ProofSchema], default: [] },
  messages: { type: [MessageSchema], default: [] },
  dispute: { type: DisputeSchema, default: () => ({ raised: false }) },
  deadlineReminderSentAt: { type: Date },
}, { timestamps: true });

export const Deal: Model<IDeal> = mongoose.models.Deal || mongoose.model<IDeal>("Deal", DealSchema);
