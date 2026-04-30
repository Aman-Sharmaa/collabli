import { requireSessionUser } from "@/lib/collabli-auth";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  await requireSessionUser(["admin"]);
  return <AdminClient />;
}
