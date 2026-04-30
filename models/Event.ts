import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITicketType {
  name: string;
  price: number;
  requiresApproval: boolean;
  description?: string;
}

export interface IEvent extends Document {
  name: string;
  slug: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  address?: string;
  description: string;
  aboutEvent: string;
  photoUrl?: string;
  themeColor?: string;
  textColor?: string;
  backgroundStyle?: "solid" | "gradient" | "aurora" | "mesh";
  googleMapUrl?: string;
  eventType?: "Offline" | "Online";
  isPublicForm?: boolean;
  ticketTypes: ITicketType[];
  createdBy?: mongoose.Types.ObjectId;
}

const TicketTypeSchema = new Schema<ITicketType>({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  requiresApproval: { type: Boolean, default: false },
  description: { type: String },
});

const EventSchema: Schema<IEvent> = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    location: { type: String },
    address: { type: String },
    description: { type: String },
    aboutEvent: { type: String },
    photoUrl: { type: String },
    themeColor: { type: String, default: "#3f2b4f" },
    textColor: { type: String, default: "#ffffff" },
    backgroundStyle: { type: String, enum: ["solid", "gradient", "aurora", "mesh"], default: "solid" },
    googleMapUrl: { type: String },
    eventType: { type: String, enum: ["Offline", "Online"], default: "Offline" },
    isPublicForm: { type: Boolean, default: false },
    ticketTypes: { type: [TicketTypeSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
