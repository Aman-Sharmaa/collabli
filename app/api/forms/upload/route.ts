import { NextRequest, NextResponse } from "next/server";
import { uploadCmsImage } from "@/lib/s3";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kalp_auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    verifyToken(token);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }
    
    const url = await uploadCmsImage(file);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("Form photo upload", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
