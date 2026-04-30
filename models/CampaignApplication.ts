import mongoose, { Schema, type Document, type Model } from "mongoose";

export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type ApplicantRole = "creator" | "brand";
export type RateKind = "fixed" | "negotiable";
export type ContentFormat = "Reel" | "Story" | "Post" | "Video";

export interface IApplicationProfileSummary {
  displayName: string;
  publicHandle: string;
  platforms: string[];
  niche: string;
  /** Typical engagement rate % (e.g. 3.2) */
  engagementRatePct?: number;
}

export interface IApplicationContentPlan {
  contentIdea: string;
  platform: string;
  format: ContentFormat;
}

export interface IApplicationAudienceSnapshot {
  followers: number;
  views: number;
  engagementRatePct?: number;
  location: string;
  ageRange: string;
  gender: string;
}

export interface ICampaignApplication extends Document {
  campaignId: mongoose.Types.ObjectId;
  applicantUserId: mongoose.Types.ObjectId;
  applicantRole: ApplicantRole;
  creatorId?: mongoose.Types.ObjectId;
  pitch: string;
  status: ApplicationStatus;
  rejectionNote?: string;
  withdrawnAt?: Date;
  /** Snapshot at submit (creator → brand brief) */
  profileSummary?: IApplicationProfileSummary;
  pastSimilarWork?: string;
  portfolioLink?: string;
  campaignRateInr?: number;
  rateKind?: RateKind;
  estimatedDeliveryDate?: Date;
  contentPlans?: IApplicationContentPlan[];
  audienceSnapshot?: IApplicationAudienceSnapshot;
  termsAccepted?: boolean;
  deadlineConfirmed?: boolean;
  agreementAcceptedAt?: Date;
}

const ProfileSummarySchema = new Schema<IApplicationProfileSummary>(
  {
    displayName: { type: String, default: "" },
    publicHandle: { type: String, default: "" },
    platforms: { type: [String], default: [] },
    niche: { type: String, default: "" },
    engagementRatePct: { type: Number },
  },
  { _id: false }
);

const ContentPlanSchema = new Schema<IApplicationContentPlan>(
  {
    contentIdea: { type: String, required: true },
    platform: { type: String, required: true },
    format: { type: String, enum: ["Reel", "Story", "Post", "Video"], required: true },
  },
  { _id: false }
);

const AudienceSnapshotSchema = new Schema<IApplicationAudienceSnapshot>(
  {
    followers: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    engagementRatePct: { type: Number },
    location: { type: String, default: "" },
    ageRange: { type: String, default: "" },
    gender: { type: String, default: "" },
  },
  { _id: false }
);

const CampaignApplicationSchema = new Schema<ICampaignApplication>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    applicantUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    applicantRole: { type: String, enum: ["creator", "brand"], required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User" },
    pitch: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected", "withdrawn"], default: "pending" },
    rejectionNote: { type: String, default: "" },
    withdrawnAt: { type: Date },
    profileSummary: { type: ProfileSummarySchema },
    pastSimilarWork: { type: String, default: "" },
    portfolioLink: { type: String, default: "" },
    campaignRateInr: { type: Number },
    rateKind: { type: String, enum: ["fixed", "negotiable"] },
    estimatedDeliveryDate: { type: Date },
    contentPlans: { type: [ContentPlanSchema], default: [] },
    audienceSnapshot: { type: AudienceSnapshotSchema },
    termsAccepted: { type: Boolean, default: false },
    deadlineConfirmed: { type: Boolean, default: false },
    agreementAcceptedAt: { type: Date },
  },
  { timestamps: true }
);

CampaignApplicationSchema.index({ campaignId: 1, applicantUserId: 1 }, { unique: true });

CampaignApplicationSchema.pre("save", function () {
  const doc = this as mongoose.Document & { applicantUserId?: unknown; creatorId?: unknown; applicantRole?: string };
  if (!doc.applicantUserId && doc.creatorId) {
    doc.set("applicantUserId", doc.creatorId);
    if (!doc.applicantRole) doc.set("applicantRole", "creator");
  }
  if (doc.applicantRole === "creator" && doc.applicantUserId && !doc.creatorId) {
    doc.set("creatorId", doc.applicantUserId);
  }
});

export function applicationApplicantId(app: {
  applicantUserId?: unknown;
  creatorId?: unknown;
}): string {
  return String(app.applicantUserId || app.creatorId || "");
}

export const CampaignApplication: Model<ICampaignApplication> =
  mongoose.models.CampaignApplication ||
  mongoose.model<ICampaignApplication>("CampaignApplication", CampaignApplicationSchema);
