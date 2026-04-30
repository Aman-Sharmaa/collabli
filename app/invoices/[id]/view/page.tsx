import { connectDB } from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { CompanyProfile } from "@/models/CompanyProfile";
import { notFound } from "next/navigation";
import { InvoiceViewClient } from "./invoice-view-client";

void Client;
void Project;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoiceViewPage(props: Props) {
  const params = await props.params;

  await connectDB();

  // Public view — no auth required, find invoice by ID
  const invoice = await Invoice.findById(params.id)
    .populate("client", "name companyName email")
    .populate("project", "name")
    .lean();

  if (!invoice) {
    notFound();
  }

  // Get company profile from the invoice owner for template rendering
  const profile = await CompanyProfile.findOne({
    owner: invoice.owner,
  }).lean();

  // Serialize for client
  const serializedInvoice = {
    id: String(invoice._id),
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate?.toISOString() || new Date().toISOString(),
    template: invoice.template,
    invoiceType: invoice.invoiceType,
    senderMode: invoice.senderMode,
    sender: invoice.sender || {},
    recipient: invoice.recipient || {},
    toCompanyName: invoice.toCompanyName || "",
    toCompanyAddress: invoice.toCompanyAddress || "",
    lineItems: invoice.lineItems || [],
    subTotal: invoice.subTotal || 0,
    tax: invoice.tax || {},
    discount: invoice.discount || 0,
    roundOff: invoice.roundOff || 0,
    totalAmount: invoice.totalAmount || 0,
    amountInWords: invoice.amountInWords || "",
    currency: invoice.currency || "INR",
    bankDetails: invoice.bankDetails || {},
    purpose: invoice.purpose || "",
    notes: invoice.notes || "",
    periodFrom: invoice.periodFrom?.toISOString() || null,
    periodTo: invoice.periodTo?.toISOString() || null,
    status: invoice.status,
    dueDate: invoice.dueDate?.toISOString() || null,
    client:
      invoice.client && typeof invoice.client === "object"
        ? {
            id: String((invoice.client as any)._id),
            name: (invoice.client as any).name,
            companyName: (invoice.client as any).companyName,
          }
        : null,
    project:
      invoice.project && typeof invoice.project === "object"
        ? {
            id: String((invoice.project as any)._id),
            name: (invoice.project as any).name,
          }
        : null,
    projectPayment: invoice.projectPayment
      ? String(invoice.projectPayment)
      : null,
    phaseId: invoice.phaseId || null,
    phaseName: invoice.phaseName || null,
    month: invoice.month || null,
    category: invoice.category || "",
    uin: invoice.uin || "",
    signatureNote: invoice.signatureNote || "",
    taxDisclaimer: invoice.taxDisclaimer || "",
    createdAt: invoice.createdAt?.toISOString() || new Date().toISOString(),
  };

  const serializedProfile = profile
    ? {
        companyName: profile.companyName || "",
        legalName: profile.legalName || "",
        logoUrl: profile.logoUrl || "",
        personalDetails: profile.personalDetails || {},
        bankDetails: profile.bankDetails || {},
        companyDetails: profile.companyDetails || {},
        taxDetails: profile.taxDetails || {},
        invoiceSettings: profile.invoiceSettings || {},
      }
    : null;

  return (
    <InvoiceViewClient invoice={serializedInvoice} profile={serializedProfile} />
  );
}
