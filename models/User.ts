import mongoose, { Schema, Document, Model } from "mongoose";
import type { UserRole } from "@/lib/auth";

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
  authProvider?: "email" | "google";
  avatarUrl?: string;
  company?: string;
  canManageContent?: boolean;
  featureAccess?: string[];
  accessGroupId?: string;
  googleCalendarAccessToken?: string;
  googleCalendarRefreshToken?: string;
  googleCalendarExpiryDate?: Date;
  googleCalendarEmail?: string;
  lastViewedLeadsAt?: Date;
  lastViewedOnboardingAt?: Date;
  lastViewedTasksAt?: Date;
  lastViewedDeploymentsAt?: Date;
  approvalStatus?: "pending" | "approved" | "rejected";
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  /** Public @username for /u/[handle] (creators & brands). */
  publicHandle?: string;
  notificationPrefs?: {
    dealUpdates: boolean;
    messages: boolean;
    payments: boolean;
    deadlines: boolean;
    marketing: boolean;
  };
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ["creator", "brand", "admin", "employee", "client", "lead"], default: "creator" },
  authProvider: { type: String, enum: ["email", "google"], default: "email" },
  avatarUrl: { type: String },
  company: { type: String },
  canManageContent: { type: Boolean, default: false },
  featureAccess: { type: [String], default: [] },
  accessGroupId: { type: String },
  googleCalendarAccessToken: { type: String },
  googleCalendarRefreshToken: { type: String },
  googleCalendarExpiryDate: { type: Date },
  googleCalendarEmail: { type: String },
  lastViewedLeadsAt: { type: Date },
  lastViewedOnboardingAt: { type: Date },
  lastViewedTasksAt: { type: Date },
  lastViewedDeploymentsAt: { type: Date },
  approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },
  publicHandle: { type: String, sparse: true, unique: true, trim: true, lowercase: true },
  notificationPrefs: {
    type: {
      dealUpdates: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      deadlines: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    default: undefined,
  },
  deletedAt: { type: Date },
}, { timestamps: true });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
