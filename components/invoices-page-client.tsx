"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, FileText, Eye, Edit, Trash2, MoreHorizontal, Printer, Download,
  Search, Filter, ArrowLeft, ArrowRight, Save, Loader2, Copy, Send,
  FileSpreadsheet, Settings, X, ChevronDown, ChevronUp, Check,
  CheckCircle, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  InvoiceData, InvoiceRenderer, LineItem, InvoiceTax,
  numberToWords, fmt, statusColor,
} from "@/components/invoice-templates";

interface ClientData { id: string; name: string; companyName: string; email: string; companyAddress: string; gstin: string; pan: string; phone: string; }
interface ProjectData { id: string; name: string; clientId: string; clientName: string; status: string; }
interface PaymentData {
  id: string; client: { id: string; name: string; companyName: string };
  project: { id: string; name: string } | null; totalAmount: number;
  currency: string; billingCycle: string;
  phases: { _id: string; name: string; amount: number; percentage: number; status: string }[];
  monthlyBreakdown: { month: string; amount: number }[];
  status: string; createdAt: string;
}

interface Props {
  invoices: InvoiceData[]; clients: ClientData[]; projects: ProjectData[];
  companyProfile: any; payments: PaymentData[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildSender(profile: any, mode: string) {
  const s = profile?.invoiceSettings || {};
  return {
    name: mode === "personal" ? (s.personalName || profile?.personalDetails?.contactName || "") : (profile?.companyName || ""),
    address: [profile?.companyDetails?.address, profile?.companyDetails?.city, profile?.companyDetails?.state, profile?.companyDetails?.zip].filter(Boolean).join(", "),
    email: profile?.personalDetails?.email || "",
    phone: profile?.personalDetails?.phone || "",
    pan: profile?.taxDetails?.panNumber || "",
    gstNumber: profile?.taxDetails?.gstNumber || "",
    location: profile?.companyDetails?.city || "",
  };
}

function buildBank(profile: any) {
  return {
    accountHolderName: profile?.bankDetails?.accountHolderName || "",
    accountNumber: profile?.bankDetails?.accountNumber || "",
    bankName: "", bankBranch: "", bankAddress: "",
    ifscCode: profile?.bankDetails?.ifscCode || "",
    panCardNo: profile?.taxDetails?.panNumber || "",
    swiftCode: "",
  };
}

function freshForm(profile: any) {
  const s = profile?.invoiceSettings || {};
  const mode = s.senderMode || "company";
  return {
    invoiceNumber: "", invoiceDate: new Date().toISOString().split("T")[0],
    template: s.defaultTemplate || "professional", invoiceType: "single" as string,
    senderMode: mode, category: s.defaultCategory || "", uin: s.defaultUin || "",
    sender: buildSender(profile, mode),
    recipient: { name: "", companyName: "", address: "", email: "", gstin: "", pan: "" },
    toCompanyName: "", toCompanyAddress: "",
    clientId: "", projectId: "", paymentId: "", phaseId: "", month: "",
    lineItems: [{ description: "", rate: 0, quantity: 1, amount: 0 }] as LineItem[],
    enableGst: true, gstType: "intrastate" as string, gstRate: 18,
    discount: 0, roundOff: 0, purpose: "",
    notes: s.defaultNotes || "", periodFrom: "", periodTo: "", dueDate: "",
    signatureNote: s.defaultSignatureNote || "",
    taxDisclaimer: s.defaultTaxDisclaimer || "You shall be solely responsible for any and all taxes, retirement contributions or payments, disability insurance, unemployment taxes, and other statutory payroll type taxes applicable to this compensation.",
    bankDetails: buildBank(profile),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function InvoicesPageClient({ invoices: initialInvoices, clients, projects, companyProfile, payments }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab") || "list";
  const editId = searchParams?.get("edit");
  const viewId = searchParams?.get("view");
  const fromPayment = searchParams?.get("fromPayment");

  const [invoices, setInvoices] = useState(initialInvoices);
  const [activeTab, setActiveTab] = useState(editId ? "create" : viewId ? "view" : tabParam);
  const [form, setForm] = useState<any>(freshForm(companyProfile));
  const [editingId, setEditingId] = useState<string | null>(editId || null);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceData | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1=basics, 2=items, 3=review
  const [showAdvanced, setShowAdvanced] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState(companyProfile?.invoiceSettings || {});
  const [savingSettings, setSavingSettings] = useState(false);

  // ─── Load from URL params ─────────────────────────────────────────────
  useEffect(() => {
    if (editId) {
      const inv = invoices.find(i => i.id === editId);
      if (inv) { loadInvoice(inv); setEditingId(editId); setActiveTab("create"); setStep(1); }
    }
  }, [editId]);

  useEffect(() => {
    if (viewId) {
      const inv = invoices.find(i => i.id === viewId);
      if (inv) { setViewingInvoice(inv); setActiveTab("view"); }
    }
  }, [viewId]);

  useEffect(() => {
    if (fromPayment) {
      const p = payments.find(x => x.id === fromPayment);
      if (p) { prefillPayment(p); setActiveTab("create"); setStep(1); }
    }
  }, [fromPayment]);

  // ─── Load invoice into form ───────────────────────────────────────────

  function loadInvoice(inv: InvoiceData) {
    const gRate = inv.tax?.sgstRate ? inv.tax.sgstRate * 2 : (inv.tax?.igstRate || 18);
    setForm({
      invoiceNumber: inv.invoiceNumber, invoiceDate: inv.invoiceDate?.split("T")[0] || new Date().toISOString().split("T")[0],
      template: inv.template || "professional", invoiceType: inv.invoiceType || "single",
      senderMode: inv.senderMode || "company", category: inv.category || "", uin: inv.uin || "",
      sender: inv.sender || {}, recipient: inv.recipient || {},
      toCompanyName: inv.toCompanyName || "", toCompanyAddress: inv.toCompanyAddress || "",
      clientId: inv.client?.id || "", projectId: inv.project?.id || "",
      paymentId: inv.projectPayment || "", phaseId: inv.phaseId || "", month: inv.month || "",
      lineItems: inv.lineItems.length > 0 ? inv.lineItems : [{ description: "", rate: 0, quantity: 1, amount: 0 }],
      enableGst: !!(inv.tax?.sgstRate || inv.tax?.igstRate),
      gstType: inv.tax?.igstRate ? "interstate" : "intrastate", gstRate: gRate,
      discount: inv.discount || 0, roundOff: inv.roundOff || 0,
      purpose: inv.purpose || "", notes: inv.notes || "",
      periodFrom: inv.periodFrom?.split("T")[0] || "", periodTo: inv.periodTo?.split("T")[0] || "",
      dueDate: inv.dueDate?.split("T")[0] || "",
      signatureNote: inv.signatureNote || "", taxDisclaimer: inv.taxDisclaimer || "",
      bankDetails: inv.bankDetails || buildBank(companyProfile),
    });
  }

  function prefillPayment(pay: PaymentData) {
    const c = clients.find(x => x.id === pay.client.id);
    const f = freshForm(companyProfile);
    f.clientId = pay.client.id;
    f.projectId = pay.project?.id || "";
    f.paymentId = pay.id;
    if (c) {
      f.recipient = { name: c.name, companyName: c.companyName, address: c.companyAddress, email: c.email, gstin: c.gstin, pan: c.pan };
      f.toCompanyName = c.companyName; f.toCompanyAddress = c.companyAddress;
    }
    if (pay.billingCycle === "phases" && pay.phases.length > 0) f.invoiceType = "phase";
    else if (pay.billingCycle === "monthly") f.invoiceType = "monthly";
    f.lineItems = [{ description: `Services towards ${pay.project?.name || "Project Payment"}`, rate: 0, quantity: 1, amount: pay.totalAmount }];
    setForm(f);
  }

  // ─── Handlers ─────────────────────────────────────────────────────────

  function pickClient(id: string) {
    const c = clients.find(x => x.id === id);
    setForm((f: any) => ({
      ...f, clientId: id,
      recipient: c ? { name: c.name, companyName: c.companyName, address: c.companyAddress, email: c.email, gstin: c.gstin, pan: c.pan } : f.recipient,
      toCompanyName: c?.companyName || "", toCompanyAddress: c?.companyAddress || "",
    }));
  }

  function pickPayment(id: string) {
    if (id === "none") { setForm((f: any) => ({ ...f, paymentId: "" })); return; }
    const p = payments.find(x => x.id === id);
    if (!p) return;
    setForm((f: any) => ({
      ...f, paymentId: id,
      lineItems: [{ description: `Services towards ${p.project?.name || "Project Payment"}`, rate: 0, quantity: 1, amount: p.totalAmount }],
    }));
  }

  function addItem() { setForm((f: any) => ({ ...f, lineItems: [...f.lineItems, { description: "", rate: 0, quantity: 1, amount: 0 }] })); }
  function removeItem(i: number) { setForm((f: any) => ({ ...f, lineItems: f.lineItems.filter((_: any, j: number) => j !== i) })); }
  function updateItem(i: number, key: string, val: any) {
    setForm((f: any) => {
      const items = [...f.lineItems];
      items[i] = { ...items[i], [key]: val };
      if (key === "rate" || key === "quantity") items[i].amount = (Number(items[i].rate) || 0) * (Number(items[i].quantity) || 1);
      return { ...f, lineItems: items };
    });
  }

  // ─── Calculated values ────────────────────────────────────────────────

  const subTotal = form.lineItems.reduce((s: number, i: LineItem) => s + (Number(i.amount) || 0), 0);
  const discount = Number(form.discount) || 0;
  const taxable = subTotal - discount;
  const gstRate = form.enableGst ? (Number(form.gstRate) || 0) : 0;
  let tax: InvoiceTax = {};
  if (form.enableGst && gstRate > 0) {
    if (form.gstType === "interstate") tax = { igstRate: gstRate, igstAmount: (taxable * gstRate) / 100 };
    else { const h = gstRate / 2; tax = { sgstRate: h, sgstAmount: (taxable * h) / 100, cgstRate: h, cgstAmount: (taxable * h) / 100 }; }
  }
  const totalTax = (tax.sgstAmount || 0) + (tax.cgstAmount || 0) + (tax.igstAmount || 0);
  const roundOff = Number(form.roundOff) || 0;
  const totalAmount = taxable + totalTax + roundOff;

  const currentPayment = payments.find((p) => p.id === form.paymentId);
  const canProceedStep1 =
    !!form.clientId &&
    !!form.invoiceDate &&
    (form.invoiceType !== "phase" || !form.paymentId || !!form.phaseId) &&
    (form.invoiceType !== "monthly" || !form.paymentId || !!form.month);
  const hasAtLeastOneLine = form.lineItems.some((i: LineItem) => i.description?.trim() && (Number(i.amount) || 0) > 0);

  // ─── Save ─────────────────────────────────────────────────────────────

  async function handleSave(statusOverride?: string) {
    setSaving(true);
    try {
      const payload = {
        invoiceNumber: form.invoiceNumber || undefined, invoiceDate: form.invoiceDate,
        template: form.template, invoiceType: form.invoiceType, senderMode: form.senderMode,
        category: form.category, uin: form.uin, sender: form.sender, recipient: form.recipient,
        toCompanyName: form.toCompanyName, toCompanyAddress: form.toCompanyAddress,
        lineItems: form.lineItems.filter((i: LineItem) => i.description),
        subTotal, tax, discount, roundOff, totalAmount, amountInWords: numberToWords(totalAmount),
        currency: "INR", bankDetails: form.bankDetails, purpose: form.purpose, notes: form.notes,
        periodFrom: form.periodFrom || undefined, periodTo: form.periodTo || undefined,
        status: statusOverride || "draft", dueDate: form.dueDate || undefined,
        client: form.clientId || undefined, project: form.projectId || undefined,
        projectPayment: form.paymentId || undefined, phaseId: form.phaseId || undefined,
        month: form.month || undefined, signatureNote: form.signatureNote, taxDisclaimer: form.taxDisclaimer,
      };
      const url = editingId ? `/api/invoices/${editingId}` : "/api/invoices";
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed"); }
      toast.success(editingId ? "Invoice updated" : "Invoice created");
      router.refresh();
      setForm(freshForm(companyProfile)); setEditingId(null); setActiveTab("list"); setStep(1);
      router.push("/dashboard/invoices");
    } catch (e: any) { toast.error(e.message || "Failed to save invoice"); } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/invoices/${deletingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Invoice deleted"); setInvoices(prev => prev.filter(i => i.id !== deletingId));
      setDeleteDialogOpen(false); setDeletingId(null);
    } catch { toast.error("Failed to delete invoice"); }
  }

  async function handleMarkPaid(invoiceId: string) {
    setMarkingPaid(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/mark-paid`, { method: "POST" });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed"); }
      const data = await res.json();
      if (data.invoice) {
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? data.invoice : inv));
        if (viewingInvoice?.id === invoiceId) setViewingInvoice(data.invoice);
      }
      toast.success("Invoice marked as paid" + (data.paymentUpdated ? " & payment record updated" : ""));
    } catch (e: any) { toast.error(e.message || "Failed to mark as paid"); } finally { setMarkingPaid(null); }
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/invoices/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      if (!res.ok) throw new Error("Failed"); toast.success("Invoice settings saved");
    } catch { toast.error("Failed to save settings"); } finally { setSavingSettings(false); }
  }

  // ─── Nav helpers ──────────────────────────────────────────────────────

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return inv.invoiceNumber.toLowerCase().includes(q) || inv.client?.name?.toLowerCase().includes(q) || inv.client?.companyName?.toLowerCase().includes(q) || inv.project?.name?.toLowerCase().includes(q);
    }
    return true;
  });

  function goTab(tab: string) {
    setActiveTab(tab);
    if (tab === "list") router.push("/dashboard/invoices");
    else if (tab === "create") { if (!editingId) { setForm(freshForm(companyProfile)); setStep(1); } router.push("/dashboard/invoices?tab=create"); }
    else if (tab === "settings") router.push("/dashboard/invoices?tab=settings");
  }

  function startNew() { setForm(freshForm(companyProfile)); setEditingId(null); setStep(1); setActiveTab("create"); router.push("/dashboard/invoices?tab=create"); }
  function startEdit(inv: InvoiceData) { loadInvoice(inv); setEditingId(inv.id); setStep(1); setActiveTab("create"); }
  function startView(inv: InvoiceData) { setViewingInvoice(inv); setActiveTab("view"); }

  function buildPreview(): InvoiceData {
    const cl = clients.find(c => c.id === form.clientId);
    const pr = projects.find(p => p.id === form.projectId);
    return { ...form, id: "preview", totalAmount, subTotal, tax, discount, roundOff, amountInWords: numberToWords(totalAmount), lineItems: form.lineItems.filter((i: LineItem) => i.description), status: "draft", createdAt: new Date().toISOString(), client: cl ? { id: cl.id, name: cl.name, companyName: cl.companyName } : null, project: pr ? { id: pr.id, name: pr.name } : null, projectPayment: form.paymentId } as any;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">Create, manage and track invoices</p>
        </div>
        <Button onClick={startNew} className="gap-2"><Plus className="h-4 w-4" /> New Invoice</Button>
      </div>

      <Tabs value={activeTab} onValueChange={goTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="list" className="gap-1.5 text-xs"><Eye className="h-3.5 w-3.5" /> All</TabsTrigger>
          <TabsTrigger value="create" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" /> {editingId ? "Edit" : "Create"}</TabsTrigger>
          <TabsTrigger value="view" className="gap-1.5 text-xs" disabled={!viewingInvoice}><FileSpreadsheet className="h-3.5 w-3.5" /> Preview</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5 text-xs"><Settings className="h-3.5 w-3.5" /> Settings</TabsTrigger>
        </TabsList>

        {/* ════════════ LIST ════════════ */}
        <TabsContent value="list" className="space-y-4 mt-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]"><Filter className="h-3.5 w-3.5 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredInvoices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold text-lg">No invoices yet</h3>
                <p className="text-muted-foreground text-sm mt-1 mb-4">Set up your details in Settings first, then create invoices in seconds.</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => goTab("settings")} className="gap-2"><Settings className="h-4 w-4" /> Setup Settings</Button>
                  <Button onClick={startNew} className="gap-2"><Plus className="h-4 w-4" /> Create Invoice</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(inv => (
                      <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => startView(inv)}>
                        <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(inv.invoiceDate).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell>{inv.client?.companyName || inv.client?.name || "—"}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize text-xs">{inv.invoiceType}</Badge></TableCell>
                        <TableCell className="text-right font-medium">{fmt(inv.totalAmount, inv.currency)}</TableCell>
                        <TableCell><Badge variant="outline" className={`capitalize text-xs ${statusColor(inv.status)}`}>{inv.status}</Badge></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={e => { e.stopPropagation(); startView(inv); }}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                              <DropdownMenuItem onClick={e => { e.stopPropagation(); window.open(`/invoices/${inv.id}/view`, "_blank"); }}><ExternalLink className="mr-2 h-4 w-4" /> Open Full Page</DropdownMenuItem>
                              <DropdownMenuItem onClick={e => { e.stopPropagation(); startEdit(inv); }}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              {inv.status !== "paid" && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleMarkPaid(inv.id); }} disabled={markingPaid === inv.id}><CheckCircle className="mr-2 h-4 w-4" /> {markingPaid === inv.id ? "Marking..." : "Mark as Paid"}</DropdownMenuItem>}
                              <DropdownMenuItem onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(inv.invoiceNumber); toast.success("Copied!"); }}><Copy className="mr-2 h-4 w-4" /> Copy #</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={e => { e.stopPropagation(); setDeletingId(inv.id); setDeleteDialogOpen(true); }}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ════════════ CREATE / EDIT ════════════ */}
        <TabsContent value="create" className="mt-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[{ n: 1, label: "Basics" }, { n: 2, label: "Items & Amount" }, { n: 3, label: "Review & Save" }].map(({ n, label }) => (
              <button key={n} onClick={() => setStep(n)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step === n ? "bg-primary text-primary-foreground shadow-sm" : step > n ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                {step > n ? <Check className="h-3.5 w-3.5" /> : <span className="h-5 w-5 rounded-full bg-background/20 flex items-center justify-center text-xs">{n}</span>}
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* ───── STEP 1: Basics ───── */}
          {step === 1 && (
            <div className="space-y-5 max-w-2xl">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Who is this invoice for?</CardTitle>
                  <CardDescription>Pick the client. Recipient details auto-fill from their record.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Client *</Label>
                    <Select value={form.clientId} onValueChange={pickClient}>
                      <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                      <SelectContent>
                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName} ({c.name})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Select value={form.projectId} onValueChange={v => setForm((f: any) => ({ ...f, projectId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                        <SelectContent>
                          {projects.filter(p => !form.clientId || p.clientId === form.clientId).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Record</Label>
                      <Select value={form.paymentId || "none"} onValueChange={pickPayment}>
                        <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {payments.filter(p => !form.clientId || p.client.id === form.clientId).map(p => <SelectItem key={p.id} value={p.id}>{p.project?.name || p.client.companyName} - {fmt(p.totalAmount, p.currency)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Invoice options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Template selector */}
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[{ v: "professional", l: "Professional" }, { v: "modern", l: "Modern" }, { v: "classic", l: "Classic" }, { v: "reimbursement", l: "Reimbursement" }].map(t => (
                        <button key={t.v} type="button" onClick={() => setForm((f: any) => ({ ...f, template: t.v }))}
                          className={`py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all text-center ${form.template === t.v ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/20"}`}>
                          {t.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={form.invoiceType} onValueChange={v => setForm((f: any) => ({ ...f, invoiceType: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="phase">Phase</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice as</Label>
                      <Select value={form.senderMode} onValueChange={v => setForm((f: any) => ({ ...f, senderMode: v, sender: buildSender(companyProfile, v) }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">Personal Name</SelectItem>
                          <SelectItem value="company">Company Name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={form.invoiceDate} onChange={e => setForm((f: any) => ({ ...f, invoiceDate: e.target.value }))} />
                    </div>
                  </div>

                  {/* Phase / Month selection */}
                  {form.invoiceType === "phase" && form.paymentId && (
                    <div className="space-y-2">
                      <Label>Select Phase</Label>
                      <Select value={form.phaseId} onValueChange={v => setForm((f: any) => ({ ...f, phaseId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Pick phase" /></SelectTrigger>
                        <SelectContent>
                          {payments.find(p => p.id === form.paymentId)?.phases.map(ph => <SelectItem key={ph._id} value={ph._id}>{ph.name} - {fmt(ph.amount)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {form.invoiceType === "monthly" && form.paymentId && (
                    <div className="space-y-2">
                      <Label>Select Month</Label>
                      <Select value={form.month} onValueChange={v => setForm((f: any) => ({ ...f, month: v }))}>
                        <SelectTrigger><SelectValue placeholder="Pick month" /></SelectTrigger>
                        <SelectContent>
                          {payments.find(p => p.id === form.paymentId)?.monthlyBreakdown.map(m => <SelectItem key={m.month} value={m.month}>{m.month} - {fmt(m.amount)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {currentPayment && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Linked payment snapshot</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Project</span><p className="font-medium">{currentPayment.project?.name || "—"}</p></div>
                    <div><span className="text-muted-foreground">Billing cycle</span><p className="font-medium capitalize">{currentPayment.billingCycle}</p></div>
                    <div><span className="text-muted-foreground">Total amount</span><p className="font-medium">{fmt(currentPayment.totalAmount, currentPayment.currency)}</p></div>
                    <div><span className="text-muted-foreground">Status</span><p className="font-medium capitalize">{currentPayment.status}</p></div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {!canProceedStep1 ? "Pick client/date and required phase/month selection to continue." : "Ready to add items and totals."}
                </p>
                <Button onClick={() => setStep(2)} className="gap-2" disabled={!canProceedStep1}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ───── STEP 2: Items & Amount ───── */}
          {step === 2 && (
            <div className="space-y-5 max-w-3xl">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Line Items</CardTitle>
                      <CardDescription>Add services / work done and their amounts</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={addItem} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Row</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Header row */}
                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground px-1">
                      <div className="w-6">#</div>
                      <div className="flex-1">Description</div>
                      <div className="w-24 text-right">Rate</div>
                      <div className="w-16 text-right">Qty</div>
                      <div className="w-28 text-right">Amount (₹)</div>
                      <div className="w-9"></div>
                    </div>
                    {form.lineItems.map((item: LineItem, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="text-xs text-muted-foreground w-6">{idx + 1}.</div>
                        <Input className="flex-1" value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Service description" />
                        <Input className="w-24 text-right" type="number" value={item.rate || ""} onChange={e => updateItem(idx, "rate", Number(e.target.value))} placeholder="Rate" />
                        <Input className="w-16 text-right" type="number" value={item.quantity || 1} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} />
                        <Input className="w-28 text-right font-medium" type="number" value={item.amount || ""} onChange={e => updateItem(idx, "amount", Number(e.target.value))} placeholder="Amount" />
                        {form.lineItems.length > 1 ? (
                          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-red-600" onClick={() => removeItem(idx)}><X className="h-4 w-4" /></Button>
                        ) : <div className="w-9" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tax & total - compact */}
              <Card>
                <CardContent className="pt-5">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Tax controls */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Switch checked={form.enableGst} onCheckedChange={v => setForm((f: any) => ({ ...f, enableGst: v }))} />
                        <Label className="text-sm">Apply GST</Label>
                      </div>
                      {form.enableGst && (
                        <div className="flex gap-3">
                          <Select value={form.gstType} onValueChange={v => setForm((f: any) => ({ ...f, gstType: v }))}>
                            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="intrastate">SGST + CGST</SelectItem>
                              <SelectItem value="interstate">IGST</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1.5">
                            <Input className="w-16 text-right" type="number" value={form.gstRate} onChange={e => setForm((f: any) => ({ ...f, gstRate: Number(e.target.value) }))} />
                            <span className="text-sm text-muted-foreground">%</span>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Discount</Label>
                          <Input className="w-28" type="number" value={form.discount || ""} onChange={e => setForm((f: any) => ({ ...f, discount: Number(e.target.value) }))} placeholder="0" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Round Off</Label>
                          <Input className="w-28" type="number" value={form.roundOff || ""} onChange={e => setForm((f: any) => ({ ...f, roundOff: Number(e.target.value) }))} step="0.01" placeholder="0" />
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="w-64 space-y-2 text-sm border-l pl-6">
                      <div className="flex justify-between"><span className="text-muted-foreground">Sub-Total</span><span className="font-medium">{fmt(subTotal)}</span></div>
                      {discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-red-600">- {fmt(discount)}</span></div>}
                      {form.enableGst && form.gstType === "intrastate" && <>
                        <div className="flex justify-between"><span className="text-muted-foreground">SGST ({tax.sgstRate}%)</span><span>{fmt(tax.sgstAmount || 0)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">CGST ({tax.cgstRate}%)</span><span>{fmt(tax.cgstAmount || 0)}</span></div>
                      </>}
                      {form.enableGst && form.gstType === "interstate" && <div className="flex justify-between"><span className="text-muted-foreground">IGST ({tax.igstRate}%)</span><span>{fmt(tax.igstAmount || 0)}</span></div>}
                      {roundOff !== 0 && <div className="flex justify-between"><span className="text-muted-foreground">Round Off</span><span>{fmt(roundOff)}</span></div>}
                      <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>{fmt(totalAmount)}</span></div>
                      <p className="text-[11px] text-muted-foreground italic leading-tight">{numberToWords(totalAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button onClick={() => setStep(3)} className="gap-2" disabled={!hasAtLeastOneLine}>
                  Review <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ───── STEP 3: Review & Save ───── */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Quick summary card */}
              <Card>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-muted-foreground block text-xs mb-0.5">From</span><span className="font-medium">{form.sender?.name || "—"}</span></div>
                    <div><span className="text-muted-foreground block text-xs mb-0.5">To</span><span className="font-medium">{form.recipient?.companyName || form.recipient?.name || "—"}</span></div>
                    <div><span className="text-muted-foreground block text-xs mb-0.5">Template</span><span className="font-medium capitalize">{form.template}</span></div>
                    <div><span className="text-muted-foreground block text-xs mb-0.5">Total</span><span className="font-bold text-base">{fmt(totalAmount)}</span></div>
                  </div>
                </CardContent>
              </Card>

              {/* Live preview */}
              <div ref={printRef}>
                <InvoiceRenderer invoice={buildPreview()} profile={companyProfile} />
              </div>

              {/* Advanced overrides - collapsed by default */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="gap-2 text-muted-foreground w-full justify-start">
                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    Edit details (sender, recipient, bank, notes)
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sender */}
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">From (Sender)</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        <Input placeholder="Name" value={form.sender.name || ""} onChange={e => setForm((f: any) => ({ ...f, sender: { ...f.sender, name: e.target.value } }))} />
                        <Input placeholder="Email" value={form.sender.email || ""} onChange={e => setForm((f: any) => ({ ...f, sender: { ...f.sender, email: e.target.value } }))} />
                        <Input placeholder="Phone" value={form.sender.phone || ""} onChange={e => setForm((f: any) => ({ ...f, sender: { ...f.sender, phone: e.target.value } }))} />
                        <Textarea placeholder="Address" rows={2} value={form.sender.address || ""} onChange={e => setForm((f: any) => ({ ...f, sender: { ...f.sender, address: e.target.value } }))} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="PAN" value={form.sender.pan || ""} onChange={e => setForm((f: any) => ({ ...f, sender: { ...f.sender, pan: e.target.value } }))} />
                          <Input placeholder="GST No." value={form.sender.gstNumber || ""} onChange={e => setForm((f: any) => ({ ...f, sender: { ...f.sender, gstNumber: e.target.value } }))} />
                        </div>
                      </CardContent>
                    </Card>
                    {/* Recipient */}
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">To (Recipient)</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        <Input placeholder="Contact Name" value={form.recipient.name || ""} onChange={e => setForm((f: any) => ({ ...f, recipient: { ...f.recipient, name: e.target.value } }))} />
                        <Input placeholder="Company Name" value={form.recipient.companyName || ""} onChange={e => setForm((f: any) => ({ ...f, recipient: { ...f.recipient, companyName: e.target.value } }))} />
                        <Input placeholder="Email" value={form.recipient.email || ""} onChange={e => setForm((f: any) => ({ ...f, recipient: { ...f.recipient, email: e.target.value } }))} />
                        <Textarea placeholder="Address" rows={2} value={form.recipient.address || ""} onChange={e => setForm((f: any) => ({ ...f, recipient: { ...f.recipient, address: e.target.value } }))} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="GSTIN" value={form.recipient.gstin || ""} onChange={e => setForm((f: any) => ({ ...f, recipient: { ...f.recipient, gstin: e.target.value } }))} />
                          <Input placeholder="PAN" value={form.recipient.pan || ""} onChange={e => setForm((f: any) => ({ ...f, recipient: { ...f.recipient, pan: e.target.value } }))} />
                        </div>
                      </CardContent>
                    </Card>
                    {/* Bank */}
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Wire Transfer Details</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="A/C Holder" value={form.bankDetails.accountHolderName || ""} onChange={e => setForm((f: any) => ({ ...f, bankDetails: { ...f.bankDetails, accountHolderName: e.target.value } }))} />
                          <Input placeholder="A/C Number" value={form.bankDetails.accountNumber || ""} onChange={e => setForm((f: any) => ({ ...f, bankDetails: { ...f.bankDetails, accountNumber: e.target.value } }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Bank Name" value={form.bankDetails.bankName || ""} onChange={e => setForm((f: any) => ({ ...f, bankDetails: { ...f.bankDetails, bankName: e.target.value } }))} />
                          <Input placeholder="IFSC" value={form.bankDetails.ifscCode || ""} onChange={e => setForm((f: any) => ({ ...f, bankDetails: { ...f.bankDetails, ifscCode: e.target.value } }))} />
                        </div>
                        <Input placeholder="Swift Code" value={form.bankDetails.swiftCode || ""} onChange={e => setForm((f: any) => ({ ...f, bankDetails: { ...f.bankDetails, swiftCode: e.target.value } }))} />
                      </CardContent>
                    </Card>
                    {/* Extra */}
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Extra Details</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Invoice No." value={form.invoiceNumber} onChange={e => setForm((f: any) => ({ ...f, invoiceNumber: e.target.value }))} />
                          <Input placeholder="UIN / Contract" value={form.uin} onChange={e => setForm((f: any) => ({ ...f, uin: e.target.value }))} />
                        </div>
                        <Input placeholder="Category (e.g. Consultant)" value={form.category} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))} />
                        <Textarea placeholder="Notes" rows={2} value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} />
                        <Textarea placeholder="Tax Disclaimer" rows={2} value={form.taxDisclaimer} onChange={e => setForm((f: any) => ({ ...f, taxDisclaimer: e.target.value }))} />
                      </CardContent>
                    </Card>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Actions */}
              <div className="flex justify-between items-center border-t pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Draft
                  </Button>
                  <Button onClick={() => handleSave("sent")} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Save & Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ════════════ VIEW / PREVIEW ════════════ */}
        <TabsContent value="view" className="space-y-4 mt-6">
          {viewingInvoice ? (
            <>
              <div className="flex items-center justify-between print:hidden">
                <Button variant="ghost" onClick={() => { setViewingInvoice(null); setActiveTab("list"); }} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
                <div className="flex gap-2">
                  {viewingInvoice.status !== "paid" && (
                    <Button size="sm" onClick={() => handleMarkPaid(viewingInvoice.id)} disabled={markingPaid === viewingInvoice.id} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                      {markingPaid === viewingInvoice.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />} Mark as Paid
                    </Button>
                  )}
                  {viewingInvoice.status === "paid" && (
                    <Badge variant="outline" className="capitalize text-xs bg-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1.5">Paid</Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={() => startEdit(viewingInvoice)} className="gap-1.5"><Edit className="h-3.5 w-3.5" /> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(`/invoices/${viewingInvoice.id}/view`, "_blank")} className="gap-1.5"><ExternalLink className="h-3.5 w-3.5" /> Full Page</Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5"><Printer className="h-3.5 w-3.5" /> Print</Button>
                  <Button variant="outline" size="sm" onClick={() => { toast.info("Use Print > Save as PDF"); setTimeout(() => window.print(), 500); }} className="gap-1.5"><Download className="h-3.5 w-3.5" /> PDF</Button>
                </div>
              </div>
              <InvoiceRenderer invoice={viewingInvoice} profile={companyProfile} />
            </>
          ) : (
            <Card><CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Eye className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold">No invoice selected</h3>
              <p className="text-muted-foreground text-sm mt-1">Pick one from the list to preview</p>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ════════════ SETTINGS ════════════ */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Invoice Settings</h2>
              <p className="text-muted-foreground text-sm">Set once. Every new invoice uses these defaults automatically.</p>
            </div>
            <Button onClick={handleSaveSettings} disabled={savingSettings} className="gap-2">
              {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Your Identity on Invoices</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Default sender</Label>
                  <Select value={settings.senderMode || "company"} onValueChange={v => setSettings((s: any) => ({ ...s, senderMode: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">My Name</SelectItem>
                      <SelectItem value="company">Company Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Personal Name</Label>
                  <Input value={settings.personalName || ""} onChange={e => setSettings((s: any) => ({ ...s, personalName: e.target.value }))} placeholder="Your full name for invoices" />
                </div>
                <div className="space-y-2">
                  <Label>Default Category</Label>
                  <Input value={settings.defaultCategory || ""} onChange={e => setSettings((s: any) => ({ ...s, defaultCategory: e.target.value }))} placeholder="e.g. Consultant / Senior Fellow" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Invoice Numbering</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Prefix</Label>
                  <Input value={settings.invoicePrefix || ""} onChange={e => setSettings((s: any) => ({ ...s, invoicePrefix: e.target.value }))} placeholder="e.g. AG or INV" />
                </div>
                <div className="space-y-2">
                  <Label>UIN / Contract No.</Label>
                  <Input value={settings.defaultUin || ""} onChange={e => setSettings((s: any) => ({ ...s, defaultUin: e.target.value }))} placeholder="Default contract number" />
                </div>
                <div className="space-y-2">
                  <Label>Next Serial</Label>
                  <Input type="number" value={settings.nextSerial || 1} onChange={e => setSettings((s: any) => ({ ...s, nextSerial: Number(e.target.value) }))} />
                </div>
                <p className="text-xs text-muted-foreground">Format: PREFIX/Month/SERIAL &rarr; AG/April/001</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Default Template</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: "professional", l: "Professional" }, { v: "modern", l: "Modern" }, { v: "classic", l: "Classic" }, { v: "reimbursement", l: "Reimbursement" }].map(t => (
                    <button key={t.v} type="button" onClick={() => setSettings((s: any) => ({ ...s, defaultTemplate: t.v }))}
                      className={`py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${(settings.defaultTemplate || "professional") === t.v ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/20"}`}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Default Notes & Disclaimers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea value={settings.defaultNotes || ""} onChange={e => setSettings((s: any) => ({ ...s, defaultNotes: e.target.value }))} placeholder="Default notes on all invoices" rows={2} />
                <Textarea value={settings.defaultTaxDisclaimer || ""} onChange={e => setSettings((s: any) => ({ ...s, defaultTaxDisclaimer: e.target.value }))} placeholder="Tax disclaimer" rows={2} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Templates are imported from @/components/invoice-templates
