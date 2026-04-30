import { requireFeatureAccess } from "@/lib/auth";
import { DrivePageClient } from "@/components/drive-page-client";

export default async function DrivePage() {
  const user = await requireFeatureAccess("drive");
  return <DrivePageClient isAdmin={user.role === "admin"} />;
}
