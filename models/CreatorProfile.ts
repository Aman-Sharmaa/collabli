import mongoose, { Schema, type Document, type Model } from "mongoose";

export type SocialPlatform = "instagram" | "youtube" | "tiktok" | "x" | "other";

export interface ISocialLink {
  platform: SocialPlatform;
  profileUrl: string;
  followers?: number;
  following?: number;
}

export interface ICreatorProject {
  imageUrl: string;
  title: string;
  description?: string;
  views?: number;
  impressions?: number;
  likes?: number;
  shares?: number;
}

export interface IRateCardItem {
  name: string;
  price: number;
  description?: string;
}

export interface ICreatorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  niche: string;
  platforms: string[];
  audienceSize: number;
  location: string;
  rate: number;
  bio?: string;
  /** Structured packages (e.g. Reel, Story set) */
  rateCard: IRateCardItem[];
  /** Legacy — kept for older rows; prefer `projects`. */
  portfolio: Array<{ title: string; link: string; engagement: string }>;
  socialLinks: ISocialLink[];
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

const RateCardSchema = new Schema<IRateCardItem>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: "" },
  },
  { _id: true }
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

const CreatorProfileSchema = new Schema<ICreatorProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    niche: { type: String, default: "" },
    platforms: { type: [String], default: [] },
    audienceSize: { type: Number, default: 0 },
    location: { type: String, default: "" },
    rate: { type: Number, default: 0 },
    bio: { type: String, default: "" },
    portfolio: {
      type: [
        {
          title: { type: String, required: true },
          link: { type: String, required: true },
          engagement: { type: String, default: "" },
        },
      ],
      default: [],
    },
    socialLinks: { type: [SocialLinkSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    rateCard: { type: [RateCardSchema], default: [] },
  },
  { timestamps: true }
);

export const CreatorProfile: Model<ICreatorProfile> =
  mongoose.models.CreatorProfile || mongoose.model<ICreatorProfile>("CreatorProfile", CreatorProfileSchema);
