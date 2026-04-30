export default function InvoiceViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Public page - no auth required, no header, no sidebar
  return <>{children}</>;
}
