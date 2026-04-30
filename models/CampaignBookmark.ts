import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICampaignBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
}

const CampaignBookmarkSchema = new Schema<ICampaignBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  },
  { timestamps: true }
);

CampaignBookmarkSchema.index({ userId: 1, campaignId: 1 }, { unique: true });

export const CampaignBookmark: Model<ICampaignBookmark> =
  mongoose.models.CampaignBookmark ||
  mongoose.model<ICampaignBookmark>("CampaignBookmark", CampaignBookmarkSchema);
