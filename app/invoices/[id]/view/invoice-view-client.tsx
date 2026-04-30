"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  InvoiceData,
  InvoiceRenderer,
  fmt,
  statusColor,
} from "@/components/invoice-templates";

interface Props {
  invoice: InvoiceData;
  profile: any;
}

export function InvoiceViewClient({ invoice, profile }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .min-h-screen { min-height: auto !important; }
          .bg-gray-50 { background: white !important; }
          .print-content { padding: 0 !important; margin: 0 !important; max-width: none !important; }
        }
      `}</style>

      {/* Toolbar — public: only invoice number, status, print/PDF */}
      <div className="no-print sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">
              {invoice.invoiceNumber}
            </span>
            <Badge
              variant="outline"
              className={`capitalize text-xs ${statusColor(invoice.status)}`}
            >
              {invoice.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.info("Use Print > Save as PDF");
                setTimeout(() => window.print(), 500);
              }}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 print-content">
        {/* Paid banner */}
        {invoice.status === "paid" && (
          <div className="no-print mb-6 bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800 text-sm">
                This invoice has been paid
              </p>
              <p className="text-emerald-600 text-xs">
                Amount: {fmt(invoice.totalAmount, invoice.currency)}
              </p>
            </div>
          </div>
        )}

        <InvoiceRenderer invoice={invoice} profile={profile} />

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-gray-400 no-print">
          <p>
            &copy; {new Date().getFullYear()} Kalp.ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
