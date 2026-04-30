"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ExternalLink, Receipt, Filter } from "lucide-react";

type PaymentPhase = {
  name: string;
  amount: number;
  status?: string;
  billGeneratedAt?: string | null;
};

type PaymentRow = {
  id: string;
  client: { id: string; name: string; companyName: string };
  project: { id: string; name: string } | null;
  product: { id: string; name: string; kind: string } | null;
  totalAmount: number;
  currency: string;
  billingCycle: string;
  status: string;
  phases?: PaymentPhase[];
  createdAt?: string | null;
  billGeneratedAt?: string | null;
};

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** One row = one transaction (paid phase, full payment, or due) */
type TransactionRow = {
  id: string;
  paymentId: string;
  date: string | null;
  client: PaymentRow["client"];
  project: PaymentRow["project"];
  product: PaymentRow["product"];
  amount: number;
  currency: string;
  billingCycle: string;
  transactionLabel: string;
  status: "paid" | "due";
  clientPath: string;
};

/** Flatten payments into separate transaction rows (one per paid phase, or full payment, plus one per payment for remaining due) */
function paymentsToTransactions(payments: PaymentRow[]): TransactionRow[] {
  const out: TransactionRow[] = [];
  for (const p of payments) {
    const clientPath = `/dashboard/clients/${p.client?.id}?tab=payments`;
    if (p.phases?.length) {
      let dueAmount = 0;
      for (let i = 0; i < p.phases.length; i++) {
        const ph = p.phases[i];
        const amount = Number(ph?.amount) || 0;
        if (ph?.status === "paid") {
          out.push({
            id: `${p.id}-paid-${i}`,
            paymentId: p.id,
            date: ph.billGeneratedAt ?? p.billGeneratedAt ?? p.createdAt ?? null,
            client: p.client,
            project: p.project,
            product: p.product,
            amount,
            currency: p.currency || "INR",
            billingCycle: p.billingCycle || "",
            transactionLabel: ph?.name || `Phase ${i + 1}`,
            status: "paid",
            clientPath,
          });
        } else {
          dueAmount += amount;
        }
      }
      if (dueAmount > 0) {
        out.push({
          id: `${p.id}-due`,
          paymentId: p.id,
          date: null,
          client: p.client,
          project: p.project,
          product: p.product,
          amount: dueAmount,
          currency: p.currency || "INR",
          billingCycle: p.billingCycle || "",
          transactionLabel: "Due",
          status: "due",
          clientPath,
        });
      }
    } else {
      if (p.status === "paid") {
        out.push({
          id: `${p.id}-full`,
          paymentId: p.id,
          date: p.billGeneratedAt ?? p.createdAt ?? null,
          client: p.client,
          project: p.project,
          product: p.product,
          amount: p.totalAmount || 0,
          currency: p.currency || "INR",
          billingCycle: p.billingCycle || "",
          transactionLabel: "Full payment",
          status: "paid",
          clientPath,
        });
      } else {
        const amount = p.totalAmount || 0;
        if (amount > 0) {
          out.push({
            id: `${p.id}-due`,
            paymentId: p.id,
            date: null,
            client: p.client,
            project: p.project,
            product: p.product,
            amount,
            currency: p.currency || "INR",
            billingCycle: p.billingCycle || "",
            transactionLabel: "Due",
            status: "due",
            clientPath,
          });
        }
      }
    }
  }
  return out.sort((a, b) => {
    const dA = a.date ? new Date(a.date).getTime() : 0;
    const dB = b.date ? new Date(b.date).getTime() : 0;
    if (dB !== dA) return dB - dA;
    return a.status === "due" ? 1 : -1;
  });
}

type ClientOption = { id: string; name: string; companyName: string };
type ProjectOption = { id: string; name: string; client: string };

export function PaymentsHistoryClient() {
  const searchParams = useSearchParams();
  const showDueOnly = searchParams?.get("show") === "due";

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  const [filterClientId, setFilterClientId] = useState<string>("");
  const [filterProjectId, setFilterProjectId] = useState<string>("");
  const [filterBillingCycle, setFilterBillingCycle] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterFromDate, setFilterFromDate] = useState<string>("");
  const [filterToDate, setFilterToDate] = useState<string>("");

  const fetchPayments = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterClientId) params.set("clientId", filterClientId);
    if (filterProjectId) params.set("projectId", filterProjectId);
    if (filterBillingCycle) params.set("billingCycle", filterBillingCycle);
    if (filterFromDate) params.set("fromDate", filterFromDate);
    if (filterToDate) params.set("toDate", filterToDate);
    fetch(`/api/project-payments?${params}`)
      .then((r) => r.json())
      .then((data) => setPayments(data.payments || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [filterClientId, filterProjectId, filterBillingCycle, filterFromDate, filterToDate]);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => setClients(d.clients || []))
      .catch(() => setClients([]));
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.projects || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          client: p.client || "",
        }));
        setProjects(list);
      })
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const projectsForClient = filterClientId
    ? projects.filter((pr) => pr.client === filterClientId)
    : projects;

  const hasActiveFilters = filterClientId || filterProjectId || filterBillingCycle || filterStatus || filterFromDate || filterToDate;
  const clearFilters = () => {
    setFilterClientId("");
    setFilterProjectId("");
    setFilterBillingCycle("");
    setFilterStatus("");
    setFilterFromDate("");
    setFilterToDate("");
  };

  let transactions = paymentsToTransactions(payments);
  if (showDueOnly) {
    transactions = transactions.filter((t) => t.status === "due");
  } else if (filterStatus) {
    transactions = transactions.filter((t) => t.status === filterStatus);
  }

  return (
    <div className="space-y-4">
      {showDueOnly && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/50 p-4 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Showing only due payments. Each row links to the client&apos;s payment page.
          </p>
          <a
            href="/dashboard/payments"
            className="text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline shrink-0"
          >
            View all payments →
          </a>
        </div>
      )}
      {/* Filters */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Client</Label>
              <Select value={filterClientId || "all"} onValueChange={(v) => { setFilterClientId(v === "all" ? "" : v); setFilterProjectId(""); }}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All clients</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Project</Label>
              <Select value={filterProjectId || "all"} onValueChange={(v) => setFilterProjectId(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {projectsForClient.map((pr) => (
                    <SelectItem key={pr.id} value={pr.id}>
                      {pr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Billing cycle</Label>
              <Select value={filterBillingCycle || "all"} onValueChange={(v) => setFilterBillingCycle(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="All cycles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cycles</SelectItem>
                  <SelectItem value="one_time">One time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="phases">Phases</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">From date</Label>
              <Input
                type="date"
                className="w-[140px] h-9"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To date</Label>
              <Input
                type="date"
                className="w-[140px] h-9"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
              />
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" className="h-9" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {showDueOnly
              ? "No due payments at the moment."
              : payments.length === 0
                ? hasActiveFilters
                  ? "No payments match the filters."
                  : "No transactions yet."
                : "No transactions in this range."}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : (
            <Link href="/dashboard/clients" className="text-sm text-primary hover:underline mt-2 inline-block">
              Go to Clients →
            </Link>
          )}
        </div>
      ) : (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Project</TableHead>
              <TableHead className="font-semibold">Product / Service</TableHead>
              <TableHead className="font-semibold">Transaction</TableHead>
              <TableHead className="font-semibold text-right">Amount</TableHead>
              <TableHead className="font-semibold">Cycle</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id} className="hover:bg-muted/30">
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {tx.date ? formatDate(tx.date) : "—"}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{tx.client?.companyName || tx.client?.name || "—"}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {tx.project?.name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {tx.product ? `${tx.product.name} (${tx.product.kind})` : "—"}
                </TableCell>
                <TableCell>
                  <span className={tx.status === "due" ? "text-amber-600 dark:text-amber-400 font-medium" : ""}>
                    {tx.transactionLabel}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums font-medium">
                  {formatAmount(tx.amount, tx.currency)}
                </TableCell>
                <TableCell>
                  <span className="capitalize text-muted-foreground">
                    {tx.billingCycle?.replace("_", " ") ?? "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <Link
                    href={tx.clientPath}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
      )}
    </div>
  );
}
