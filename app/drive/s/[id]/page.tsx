import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { DriveItem } from "@/models/DriveItem";
import { getAuthUserFromCookie } from "@/lib/drive";
import { cookies } from "next/headers";

export default async function SharedLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    redirect("/not-found");
  }

  await connectDB();
  const item = await DriveItem.findById(id).lean();

  if (!item) {
    redirect("/not-found");
  }

  // Check access
  let hasAccess = false;

  if (item.visibility === "public") {
    hasAccess = true;
  } else {
    // Check cookie for access
    const cookieStore = await cookies();
    const accessEmail = cookieStore.get(`drive_access_${id}`)?.value;
    const isApprovedExternal = accessEmail && (
        item.approvedEmails?.includes(accessEmail) || 
        item.accessRequests?.some(r => r.email === accessEmail && r.status === "approved")
    );

    if (isApprovedExternal) {
      hasAccess = true;
    } else {
      // Check auth user
      const user = await getAuthUserFromCookie();
      if (user) {
        if (user.role === "admin" || String(item.owner) === user.userId) {
          hasAccess = true;
        } else if (
          item.visibility === "specific" &&
          item.sharedWith &&
          item.sharedWith.some((sharedId: any) => String(sharedId) === user.userId)
        ) {
          hasAccess = true;
        }
      }
    }
  }

  if (!hasAccess) {
    redirect(`/drive/request-access/${id}?name=${encodeURIComponent(item.name || "item")}`);
  }

  // If we have access, redirect to the content
  if (item.type === "file") {
    // Redirect to the file stream API
    redirect(`/api/drive/f/${id}/${encodeURIComponent(item.name)}`);
  } else {
    // It's a folder. For now, redirect to the dashboard if logged in, 
    // or maybe we need a public folder view?
    // User said: "under drive give option to share folder share as link publicly"
    // I will redirect to a new route /drive/folder/[id] which will be the viewer.
    redirect(`/drive/folder/${id}`);
  }
}
