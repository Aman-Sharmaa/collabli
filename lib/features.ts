/**
 * All assignable dashboard features.
 * Admins always have full access — this list is used to control employee access.
 */

export type FeatureDefinition = {
  key: string;
  label: string;
  description: string;
  group: string;
  /** If true, this feature is always available and cannot be revoked */
  alwaysOn?: boolean;
};

export const ALL_FEATURES: FeatureDefinition[] = [
  // Main
  { key: "dashboard", label: "Overview", description: "Main dashboard overview", group: "Main", alwaysOn: true },
  { key: "todo", label: "Task Board", description: "Task management and todo lists", group: "Main" },
  { key: "monitor", label: "Monitor", description: "Service monitoring dashboard", group: "Main" },
  { key: "deployments", label: "Deployments", description: "Deployment management and tracking", group: "Main" },

  // CRM
  { key: "leads", label: "Leads", description: "Lead management and tracking", group: "CRM" },
  { key: "clients", label: "Clients", description: "Client management", group: "CRM" },
  { key: "products", label: "Businesses", description: "Business and product management", group: "CRM" },

  // Work
  { key: "projects", label: "Projects", description: "Project management and tracking", group: "Work" },
  { key: "plans", label: "Documents", description: "Document creation and management", group: "Work" },
  { key: "calendar", label: "Calendar", description: "Calendar and scheduling", group: "Work" },
  { key: "drive", label: "Drive", description: "File storage, folders, and sharing", group: "Work" },

  // Finance
  { key: "payments", label: "Payments", description: "Payment tracking and history", group: "Finance" },
  { key: "invoices", label: "Invoices", description: "Invoice creation and management", group: "Finance" },
  { key: "proposals", label: "Proposals", description: "Proposal creation and sending", group: "Finance" },
  { key: "expenses", label: "Expenses", description: "Expense tracking and reporting", group: "Finance" },
  { key: "khatabook", label: "Gram Books", description: "Daily revenue and expense ledger", group: "Finance" },

  // Team & HR
  { key: "team", label: "Team Members", description: "View team members and directory", group: "Team & HR" },
  { key: "attendance", label: "Attendance", description: "Attendance tracking and logs", group: "Team & HR" },
  { key: "assets", label: "Assets", description: "Company asset management", group: "Team & HR" },

  // Personal
  { key: "reimbursements", label: "Reimbursement", description: "Submit and track reimbursements", group: "Personal" },
  { key: "payslips", label: "Payslips", description: "View salary payslips", group: "Personal" },

  // Content
  { key: "cms", label: "CMS", description: "Content management — Pages, Posts, Categories", group: "Content" },
];

/** Default features assigned to new employees (backward-compatible with the old hardcoded sidebar) */
export const DEFAULT_EMPLOYEE_FEATURES = [
  "dashboard",
  "todo",
  "projects",
  "plans",
  "calendar",
  "drive",
  "khatabook",
  "attendance",
  "reimbursements",
  "payslips",
  "team",
  "cms",
];

/** Get grouped features for UI display */
export function getGroupedFeatures() {
  const groups: Record<string, FeatureDefinition[]> = {};
  for (const f of ALL_FEATURES) {
    if (!groups[f.group]) groups[f.group] = [];
    groups[f.group].push(f);
  }
  return groups;
}
