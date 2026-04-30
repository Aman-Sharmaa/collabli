import mongoose, { Schema, type Document, type Model } from "mongoose";

export type CampaignOwnerRole = "brand" | "creator";

export interface ICampaign extends Document {
  /** Brand-owned brief (hiring creators) */
  brandId?: mongoose.Types.ObjectId;
  /** Creator-owned listing ("available for work") */
  creatorOwnerId?: mongoose.Types.ObjectId;
  title: string;
  budget: number;
  niche: string;
  deliverables: string;
  deadline: Date;
  status: "open" | "in_progress" | "closed";
  platforms: string[];
  location: string;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: "User" },
    creatorOwnerId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    budget: { type: Number, required: true },
    niche: { type: String, required: true },
    deliverables: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ["open", "in_progress", "closed"], default: "open" },
    platforms: { type: [String], default: [] },
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

CampaignSchema.index({ brandId: 1 });
CampaignSchema.index({ creatorOwnerId: 1 });

export function campaignOwnerId(c: Pick<ICampaign, "brandId" | "creatorOwnerId">): string | undefined {
  if (c.brandId) return String(c.brandId);
  if (c.creatorOwnerId) return String(c.creatorOwnerId);
  return undefined;
}

export function campaignListingLabel(c: Pick<ICampaign, "brandId" | "creatorOwnerId">): "brand_hiring" | "creator_seeking" {
  return c.creatorOwnerId ? "creator_seeking" : "brand_hiring";
}

export const Campaign: Model<ICampaign> = mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);
