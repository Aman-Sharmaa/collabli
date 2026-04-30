import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Form } from "@/models/Form";
import { FormSubmission } from "@/models/FormSubmission";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("kalp_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    verifyToken(token);

    const { slug } = await params;
    const form = await Form.findOne({ slug });
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const submissions = await FormSubmission.find({ formId: form._id }).sort({ createdAt: -1 });

    return NextResponse.json({ submissions }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const form = await Form.findOne({ slug });
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const body = await req.json();
    const submission = new FormSubmission({
      ...body,
      formId: form._id,
      status: "Pending",
    });

    await submission.save();

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
