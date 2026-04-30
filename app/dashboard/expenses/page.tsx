import { requireFeatureAccess } from "@/lib/auth";
import { ExpensesClient } from "@/components/expenses-client";

export default async function ExpensesPage() {
  await requireFeatureAccess("expenses");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b pb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track expenses by product or service. Pause, resume, or delete as needed.
          </p>
        </div>
      </div>
      <ExpensesClient />
    </div>
  );
}
