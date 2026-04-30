import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Form } from "@/models/Form";
import { FormSubmission } from "@/models/FormSubmission";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("kalp_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    verifyToken(token);

    const forms = await Form.find().sort({ createdAt: -1 }).lean();
    
    // Fetch submission counts for each form
    const formsWithCounts = await Promise.all(
      forms.map(async (form: any) => {
        const submissionCount = await FormSubmission.countDocuments({ formId: form._id });
        return { ...form, submissionCount };
      })
    );

    return NextResponse.json({ forms: formsWithCounts }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("kalp_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = verifyToken(token);

    const body = await req.json();
    const { name, slug, description, aboutForm, photoUrl, themeColor, backgroundStyle } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const existing = await Form.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const form = new Form({
      name,
      slug,
      description,
      aboutForm,
      photoUrl,
      themeColor,
      backgroundStyle,
      createdBy: user.userId,
    });

    await form.save();

    return NextResponse.json({ success: true, form }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
