import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getAuthUserFromCookie } from "@/lib/drive";
import { cookies } from "next/headers";
import { DriveItem } from "@/models/DriveItem";
import { s3Client } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const BUCKET = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; name: string }> }
) {
  try {
    const { id, name } = await params;

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid file ID" }, { status: 400 });
    }

    const item = await DriveItem.findById(id).lean();

    if (!item || item.type !== "file") {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    // Access control check
    if (item.visibility !== "public") {
      const cookieStore = await cookies();
      const accessEmail = cookieStore.get(`drive_access_${id}`)?.value;
      const isApprovedExternal = accessEmail && item.approvedEmails?.includes(accessEmail);

      if (!isApprovedExternal) {
        const user = await getAuthUserFromCookie();
        if (!user) {
          return NextResponse.redirect(new URL(`/drive/request-access/${id}?name=${encodeURIComponent(item.name)}`, req.url));
        }

        if (String(item.owner) !== user.userId && user.role !== "admin") {
          if (item.visibility === "private" || !item.visibility) {
             return NextResponse.redirect(new URL(`/drive/request-access/${id}?name=${encodeURIComponent(item.name)}`, req.url));
          }
          if (
            item.visibility === "specific" &&
            (!item.sharedWith || !item.sharedWith.some((sharedId: any) => String(sharedId) === user.userId))
          ) {
             return NextResponse.redirect(new URL(`/drive/request-access/${id}?name=${encodeURIComponent(item.name)}`, req.url));
          }
        }
      }
    }

    if (!item.fileKey) {
      if (item.fileUrl) {
        // Fallback for older items that only have fileUrl
        try {
          const externalRes = await fetch(item.fileUrl);
          if (!externalRes.ok) {
            return NextResponse.json({ message: "Failed to fetch external file" }, { status: externalRes.status });
          }
          return new NextResponse(externalRes.body as any, {
            headers: {
              "Content-Type": externalRes.headers.get("content-type") || item.mimeType || "application/octet-stream",
              "Content-Length": externalRes.headers.get("content-length") || "",
              "Content-Disposition": `inline; filename="${encodeURIComponent(item.name)}"`,
            } as any,
          });
        } catch (err) {
          return NextResponse.json({ message: "Error fetching external file" }, { status: 500 });
        }
      }
      return NextResponse.json({ message: "File data not found" }, { status: 404 });
    }

    const mimeType = item.mimeType || "application/octet-stream";

    // Handle local fallback
    if (item.fileKey.startsWith("uploads/")) {
      const filePath = path.join(process.cwd(), "public", item.fileKey);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ message: "Local file not found" }, { status: 404 });
      }
      const fileStream = fs.createReadStream(filePath);
      return new NextResponse(fileStream as any, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="${encodeURIComponent(item.name)}"`,
        },
      });
    }

    // Handle S3
    if (s3Client && BUCKET) {
      const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: item.fileKey,
      });

      const response = await s3Client.send(command);

      return new NextResponse(response.Body as any, {
        headers: {
          "Content-Type": response.ContentType || mimeType,
          "Content-Length": response.ContentLength ? String(response.ContentLength) : undefined,
          "Content-Disposition": `inline; filename="${encodeURIComponent(item.name)}"`,
        } as any,
      });
    }

    // If no local and no S3 client, but we have fileUrl, fetch and stream it
    if (item.fileUrl) {
      try {
        const externalRes = await fetch(item.fileUrl);
        if (!externalRes.ok) {
           return NextResponse.json({ message: "Failed to fetch external file" }, { status: externalRes.status });
        }
        return new NextResponse(externalRes.body as any, {
          headers: {
            "Content-Type": externalRes.headers.get("content-type") || mimeType,
            "Content-Length": externalRes.headers.get("content-length") || "",
            "Content-Disposition": `inline; filename="${encodeURIComponent(item.name)}"`,
          } as any,
        });
      } catch (err) {
        return NextResponse.json({ message: "Error fetching external file" }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "Storage not configured" }, { status: 500 });
  } catch (error: any) {
    console.error("Error streaming file:", error);
    return NextResponse.json({ message: "Failed to load file" }, { status: 500 });
  }
}
