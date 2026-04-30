"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Pause, Play, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";

type ProductOption = { _id: string; name: string; slug: string; kind: "product" | "service" };

type ExpenseRow = {
  id: string;
  productId: string;
  productName: string;
  productKind: string;
  type: string;
  amount: number;
  frequency: string;
  customMonths?: number;
  remark?: string;
  isPaused: boolean;
  createdAt?: string;
};

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  custom: "Custom",
};

function monthlyEquivalent(amount: number, frequency: string, customMonths?: number): number {
  if (frequency === "monthly") return amount;
  if (frequency === "yearly") return amount / 12;
  if (frequency === "custom" && customMonths && customMonths >= 1) return amount / customMonths;
  return amount;
}

export function ExpensesClient() {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterProductId, setFilterProductId] = useState("");
  const [filterKind, setFilterKind] = useState<"all" | "product" | "service">("all");
  const [form, setForm] = useState({
    productId: "",
    type: "",
    amount: "",
    frequency: "monthly" as "monthly" | "yearly" | "custom",
    customMonths: "",
    remark: "",
  });

  async function loadExpenses() {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (res.ok) setExpenses(data.expenses || []);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) setProducts(data.products || []);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadExpenses();
    loadProducts();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId || !form.type.trim() || !form.amount) {
      toast.error("Product/service, type, and amount are required");
      return;
    }
    if (form.frequency === "custom" && (!form.customMonths || Number(form.customMonths) < 1)) {
      toast.error("Enter custom interval (months) when frequency is Custom");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.productId,
          type: form.type.trim(),
          amount: Number(form.amount),
          frequency: form.frequency,
          customMonths: form.frequency === "custom" ? Number(form.customMonths) : undefined,
          remark: form.remark.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to add expense");
        return;
      }
      toast.success("Expense added");
      setAddOpen(false);
      setForm({ productId: "", type: "", amount: "", frequency: "monthly", customMonths: "", remark: "" });
      await loadExpenses();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editId || !form.productId || !form.type.trim() || !form.amount) {
      toast.error("Product/service, type, and amount are required");
      return;
    }
    if (form.frequency === "custom" && (!form.customMonths || Number(form.customMonths) < 1)) {
      toast.error("Enter custom interval (months) when frequency is Custom");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/expenses/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.productId,
          type: form.type.trim(),
          amount: Number(form.amount),
          frequency: form.frequency,
          customMonths: form.frequency === "custom" ? Number(form.customMonths) : undefined,
          remark: form.remark.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update expense");
        return;
      }
      toast.success("Expense updated");
      setEditId(null);
      setForm({ productId: "", type: "", amount: "", frequency: "monthly", customMonths: "", remark: "" });
      await loadExpenses();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function togglePause(row: ExpenseRow) {
    setActionId(row.id);
    try {
      const res = await fetch(`/api/expenses/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaused: !row.isPaused }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to update");
        return;
      }
      toast.success(row.isPaused ? "Expense resumed" : "Expense paused");
      await loadExpenses();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to delete");
        return;
      }
      toast.success("Expense deleted");
      await loadExpenses();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  function openEdit(row: ExpenseRow) {
    setEditId(row.id);
    setForm({
      productId: row.productId,
      type: row.type,
      amount: String(row.amount),
      frequency: row.frequency as "monthly" | "yearly" | "custom",
      customMonths: row.customMonths ? String(row.customMonths) : "",
      remark: row.remark || "",
    });
  }

  const activeExpenses = expenses.filter((e) => !e.isPaused);
  const allExpensesForTable = expenses.filter((e) => {
    if (filterProductId && e.productId !== filterProductId) return false;
    if (filterKind !== "all" && e.productKind !== filterKind) return false;
    return true;
  });

  const totalMonthlyAll = activeExpenses.reduce((s, e) => s + monthlyEquivalent(e.amount, e.frequency, e.customMonths), 0);
  const totalMonthlyProduct = activeExpenses.filter((e) => e.productKind === "product").reduce((s, e) => s + monthlyEquivalent(e.amount, e.frequency, e.customMonths), 0);
  const totalMonthlyService = activeExpenses.filter((e) => e.productKind === "service").reduce((s, e) => s + monthlyEquivalent(e.amount, e.frequency, e.customMonths), 0);
  const totalMonthlyFiltered = allExpensesForTable.filter((e) => !e.isPaused).reduce((s, e) => s + monthlyEquivalent(e.amount, e.frequency, e.customMonths), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total (active)</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            ₹{totalMonthlyAll.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">monthly equivalent</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Products</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            ₹{totalMonthlyProduct.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">monthly equivalent</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Services</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            ₹{totalMonthlyService.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">monthly equivalent</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filtered</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            ₹{totalMonthlyFiltered.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {(filterProductId || filterKind !== "all") ? "matching filters" : "all"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add expense</DialogTitle>
              <DialogDescription>Link expense to a product or service.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Product / Service *</Label>
                <Select value={form.productId} onValueChange={(v) => setForm((f) => ({ ...f, productId: v }))} required>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select product or service" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name} ({p.kind})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type of expense *</Label>
                <Input
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  placeholder="e.g. Hosting, Software, Marketing"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={form.frequency}
                  onValueChange={(v: "monthly" | "yearly" | "custom") =>
                    setForm((f) => ({ ...f, frequency: v }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="custom">Custom (every N months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.frequency === "custom" && (
                <div className="space-y-2">
                  <Label>Every N months</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.customMonths}
                    onChange={(e) => setForm((f) => ({ ...f, customMonths: e.target.value }))}
                    placeholder="e.g. 3"
                    className="rounded-xl"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Remark</Label>
                <Textarea
                  value={form.remark}
                  onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
                  placeholder="Optional note"
                  rows={2}
                  className="rounded-xl resize-none"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Add"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/20 p-3">
        <span className="text-sm font-medium text-muted-foreground">Filters:</span>
        <Select value={filterProductId || "all"} onValueChange={(v) => setFilterProductId(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[200px] rounded-xl">
            <SelectValue placeholder="Product / Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products & services</SelectItem>
            {products.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {p.name} ({p.kind})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterKind} onValueChange={(v) => setFilterKind(v as "all" | "product" | "service")}>
          <SelectTrigger className="w-[140px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="product">Product only</SelectItem>
            <SelectItem value="service">Service only</SelectItem>
          </SelectContent>
        </Select>
        {(filterProductId || filterKind !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterProductId(""); setFilterKind("all"); }}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-muted-foreground text-sm">Loading…</p>
        ) : expenses.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground text-sm">No expenses yet. Add one above.</p>
        ) : allExpensesForTable.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground text-sm">No expenses match the current filters.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product / Service</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Remark</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allExpensesForTable.map((row) => (
                <TableRow key={row.id} className={row.isPaused ? "opacity-60" : ""}>
                  <TableCell>
                    <span className="font-medium">{row.productName}</span>
                    <span className="text-xs text-muted-foreground ml-1">({row.productKind})</span>
                  </TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell className="tabular-nums">
                    ₹{row.amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {row.frequency === "custom" && row.customMonths
                      ? `Every ${row.customMonths} mo`
                      : FREQUENCY_LABELS[row.frequency] || row.frequency}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate text-muted-foreground" title={row.remark}>
                    {row.remark || "—"}
                  </TableCell>
                  <TableCell>
                    {row.isPaused ? (
                      <Badge variant="secondary">Paused</Badge>
                    ) : (
                      <Badge variant="default" className="bg-emerald-600">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(row)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePause(row)} disabled={actionId !== null}>
                          {row.isPaused ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(row.id)}
                          disabled={actionId !== null}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={(o) => !o && (setEditId(null), setForm({ productId: "", type: "", amount: "", frequency: "monthly", customMonths: "", remark: "" }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit expense</DialogTitle>
            <DialogDescription>Update expense details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Product / Service *</Label>
              <Select value={form.productId} onValueChange={(v) => setForm((f) => ({ ...f, productId: v }))} required>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select product or service" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name} ({p.kind})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type of expense *</Label>
              <Input
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                placeholder="e.g. Hosting"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={form.frequency}
                onValueChange={(v: "monthly" | "yearly" | "custom") =>
                  setForm((f) => ({ ...f, frequency: v }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom (every N months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.frequency === "custom" && (
              <div className="space-y-2">
                <Label>Every N months</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.customMonths}
                  onChange={(e) => setForm((f) => ({ ...f, customMonths: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Remark</Label>
              <Textarea
                value={form.remark}
                onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
                rows={2}
                className="rounded-xl resize-none"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditId(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
