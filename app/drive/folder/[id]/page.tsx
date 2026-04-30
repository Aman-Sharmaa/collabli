import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { DriveItem } from "@/models/DriveItem";
import { getAuthUserFromCookie } from "@/lib/drive";
import { cookies } from "next/headers";
import { PublicFolderClient } from "@/components/public-folder-client";

export default async function PublicFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    redirect("/not-found");
  }

  await connectDB();
  const rootFolder = await DriveItem.findById(id).lean();

  if (!rootFolder || rootFolder.type !== "folder") {
    redirect("/not-found");
  }

  // Double check access (same logic as shared link handler for safety)
  let hasAccess = false;
  if (rootFolder.visibility === "public") {
    hasAccess = true;
  } else {
    const cookieStore = await cookies();
    const accessEmail = cookieStore.get(`drive_access_${id}`)?.value;
    const isApprovedExternal = accessEmail && (
        rootFolder.approvedEmails?.includes(accessEmail) || 
        rootFolder.accessRequests?.some(r => r.email === accessEmail && r.status === "approved")
    );

    if (isApprovedExternal) {
      hasAccess = true;
    } else {
      const user = await getAuthUserFromCookie();
      if (user) {
        if (user.role === "admin" || String(rootFolder.owner) === user.userId) {
          hasAccess = true;
        } else if (
          rootFolder.visibility === "specific" &&
          rootFolder.sharedWith &&
          rootFolder.sharedWith.some((sharedId: any) => String(sharedId) === user.userId)
        ) {
          hasAccess = true;
        }
      }
    }
  }

  if (!hasAccess) {
    redirect(`/drive/request-access/${id}?name=${encodeURIComponent(rootFolder.name)}`);
  }

  return (
    <div className="min-h-screen bg-muted/30">
        <PublicFolderClient rootId={id} folderName={rootFolder.name} />
    </div>
  );
}
