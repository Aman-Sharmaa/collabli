import mongoose, { Schema, type Document, type Model } from "mongoose";

export type CollabliTxType = "earning" | "withdrawal";

export interface ICollabliTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  dealId?: mongoose.Types.ObjectId;
  type: CollabliTxType;
  amount: number;
  status: "pending" | "completed" | "failed";
  description: string;
  /** UPI id or bank ref for withdrawals */
  payoutDetails?: string;
  payoutMethod?: "upi" | "bank";
}

const CollabliTransactionSchema = new Schema<ICollabliTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dealId: { type: Schema.Types.ObjectId, ref: "Deal" },
    type: { type: String, enum: ["earning", "withdrawal"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
    description: { type: String, default: "" },
    payoutDetails: { type: String, default: "" },
    payoutMethod: { type: String, enum: ["upi", "bank"] },
  },
  { timestamps: true }
);

export const CollabliTransaction: Model<ICollabliTransaction> =
  mongoose.models.CollabliTransaction ||
  mongoose.model<ICollabliTransaction>("CollabliTransaction", CollabliTransactionSchema);
