import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { PaymentsHistoryClient } from "@/components/payments-history-client";

const COOKIE_NAME = "kalp_auth_token";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) redirect("/login");
  try {
    return verifyToken(token);
  } catch {
    redirect("/login");
  }
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  await requireAuth();
  const params = await searchParams;
  const showDueOnly = params?.show === "due";

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b pb-4 -mx-4 px-4 pt-4 lg:-mx-6 lg:px-6 lg:pt-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {showDueOnly ? "Due payments" : "Payments"}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {showDueOnly
            ? "Payments with outstanding dues. Click View to go to the client payment page."
            : "All transactions (full or partial, e.g. phase paid). Open a client to manage drafts and due payments."}
        </p>
      </div>
      <PaymentsHistoryClient />
    </div>
  );
}
