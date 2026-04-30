import mongoose, { Schema, Document, Model } from "mongoose";

export interface IForm extends Document {
  name: string;
  slug: string;
  description: string;
  aboutForm: string;
  photoUrl?: string;
  themeColor?: string;
  textColor?: string;
  backgroundStyle?: "solid" | "gradient" | "aurora" | "mesh";
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

const FormSchema: Schema<IForm> = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    aboutForm: { type: String },
    photoUrl: { type: String },
    themeColor: { type: String, default: "#3f2b4f" },
    textColor: { type: String, default: "#ffffff" },
    backgroundStyle: { type: String, enum: ["solid", "gradient", "aurora", "mesh"], default: "solid" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Form: Model<IForm> =
  mongoose.models.Form || mongoose.model<IForm>("Form", FormSchema);
