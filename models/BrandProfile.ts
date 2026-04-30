import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { ISocialLink, ICreatorProject } from "./CreatorProfile";

export interface IBrandProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  industry: string;
  website: string;
  location: string;
  monthlyBudget: number;
  tagline?: string;
  socialLinks: ISocialLink[];
  /** Showcase / campaign creatives */
  projects: ICreatorProject[];
}

const SocialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, enum: ["instagram", "youtube", "tiktok", "x", "other"], default: "other" },
    profileUrl: { type: String, default: "" },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProjectSchema = new Schema<ICreatorProject>(
  {
    imageUrl: { type: String, default: "" },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    views: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },
  { _id: true }
);

const BrandProfileSchema = new Schema<IBrandProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, default: "" },
    industry: { type: String, default: "" },
    website: { type: String, default: "" },
    location: { type: String, default: "" },
    monthlyBudget: { type: Number, default: 0 },
    tagline: { type: String, default: "" },
    socialLinks: { type: [SocialLinkSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
  },
  { timestamps: true }
);

export const BrandProfile: Model<IBrandProfile> =
  mongoose.models.BrandProfile || mongoose.model<IBrandProfile>("BrandProfile", BrandProfileSchema);
