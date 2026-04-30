import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFormSubmission extends Document {
  formId: mongoose.Types.ObjectId;
  status: "Pending" | "Approved" | "Rejected";
  name: string;
  email: string;
  phone: string;
  role: string;
  linkedin?: string;
  startupName?: string;
  startupAbout?: string;
  startupUrl?: string;
  investmentStage?: string;
  ticketSize?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  experienceYears?: string;
  preferredRoles?: string;
  companyName?: string;
  jobTitle?: string;
}

const FormSubmissionSchema: Schema<IFormSubmission> = new Schema(
  {
    formId: { type: Schema.Types.ObjectId, ref: "Form", required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    linkedin: { type: String },
    startupName: { type: String },
    startupAbout: { type: String },
    startupUrl: { type: String },
    investmentStage: { type: String },
    ticketSize: { type: String },
    portfolioUrl: { type: String },
    resumeUrl: { type: String },
    experienceYears: { type: String },
    preferredRoles: { type: String },
    companyName: { type: String },
    jobTitle: { type: String },
  },
  { timestamps: true }
);

export const FormSubmission: Model<IFormSubmission> =
  mongoose.models.FormSubmission ||
  mongoose.model<IFormSubmission>("FormSubmission", FormSubmissionSchema);
