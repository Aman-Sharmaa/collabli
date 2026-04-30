"use client";

import { useEffect, useState } from "react";

type Section =
  | "basic"
  | "compensation"
  | "leaves"
  | "pastPayroll"
  | "payment"
  | "statutory"
  | "other"
  | "role";

interface EmployeeSectionEditProps {
  employeeId: string;
  section: Section;
  label?: string;
  initial: any;
}

function safeNumber(value: string): number | undefined {
  if (value === "") return undefined;
  const num = Number(value.replace(/,/g, ""));
  return Number.isFinite(num) ? num : undefined;
}

export function EmployeeSectionEdit({
  employeeId,
  section,
  label = "Edit",
  initial,
}: EmployeeSectionEditProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>(initial);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [productOptions, setProductOptions] = useState<string[]>([]);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ id: string; name: string }[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);

  useEffect(() => {
    if (section !== "basic") {
      setOptionsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [productsRes, employeesRes, deptsRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/employees"),
          fetch("/api/departments"),
        ]);
        const productsData = await productsRes.json();
        const employeesData = await employeesRes.json();
        const deptsData = await deptsRes.json();
        if (!cancelled && productsRes.ok && Array.isArray(productsData.products)) {
          const products = productsData.products.filter(
            (p: any) => p.kind === "product" && p.isActive !== false
          );
          const services = productsData.products.filter(
            (p: any) => p.kind === "service" && p.isActive !== false
          );
          setProductOptions(products.map((p: any) => p.name));
          setServiceOptions(services.map((s: any) => s.name));
        }
        if (!cancelled && employeesRes.ok && Array.isArray(employeesData.employees)) {
          setEmployeeOptions(
            employeesData.employees
              .filter((e: any) => e.id !== employeeId && !e.isDismissed)
              .map((e: any) => ({ id: e.id, name: e.name || e.email || "Unknown" }))
          );
        }
        if (!cancelled && deptsRes.ok && Array.isArray(deptsData.departments)) {
          setDepartmentOptions(deptsData.departments.map((d: any) => d.name));
        }
      } catch {
        // ignore and fall back to manual values
      } finally {
        if (!cancelled) {
          setOptionsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [section, employeeId]);

  function update(key: string, value: any) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate that at least one (product or service) is assigned for basic section
    if (section === "basic") {
      const hasProduct = form.assignedProduct && form.assignedProduct !== null && form.assignedProduct.trim() !== "";
      const hasService = form.assignedService && form.assignedService !== null && form.assignedService.trim() !== "";
      
      if (!hasProduct && !hasService) {
        setError("Please assign either a Product or Service");
        return;
      }
    }

    setSaving(true);
    setError(null);

    let payload: any = {};

    switch (section) {
      case "basic":
        payload = {
          name: form.name,
          email: form.email,
          title: form.title || undefined,
          department: form.department || undefined,
          location: form.location || undefined,
          manager: form.manager || undefined,
          employeeId: form.employeeId ? Number(form.employeeId) : undefined,
          avatarUrl: form.avatarUrl || undefined,
          dateOfHiring: form.dateOfHiring
            ? new Date(form.dateOfHiring)
            : undefined,
          assignedProduct:
            form.assignedProduct === null
              ? null
              : form.assignedProduct || undefined,
          assignedService:
            form.assignedService === null
              ? null
              : form.assignedService || undefined,
          profileSlug: form.profileSlug || undefined,
          isOutsider: !!form.isOutsider,
          workStartTime: form.workStartTime || undefined,
          workEndTime: form.workEndTime || undefined,
        };
        break;
      case "compensation":
        payload = {
          annualSalary: safeNumber(form.annualSalary),
          numberOfBonuses: safeNumber(form.numberOfBonuses),
          currentAdvanceSalary: safeNumber(form.currentAdvanceSalary),
          advanceSalaryEmi: safeNumber(form.advanceSalaryEmi),
        };
        break;
      case "leaves":
        payload = {
          casualLeaveBalance: safeNumber(form.casualLeaveBalance),
          casualLeaveTotal: safeNumber(form.casualLeaveTotal),
          sickLeaveBalance: safeNumber(form.sickLeaveBalance),
          sickLeaveTotal: safeNumber(form.sickLeaveTotal),
          leaveManualOverride: true,
        };
        break;
      case "pastPayroll":
        payload = {
          taxableSalary: safeNumber(form.taxableSalary),
          exemption: safeNumber(form.exemption),
          tdsDeducted: safeNumber(form.tdsDeducted),
          prevEmployerTaxableSalary: safeNumber(form.prevEmployerTaxableSalary),
          prevEmployerTdsDeducted: safeNumber(form.prevEmployerTdsDeducted),
        };
        break;
      case "payment":
        payload = {
          bankInfo: {
            ifscCode: form.ifscCode || undefined,
            accountNumber: form.accountNumber || undefined,
            accountHolderName: form.accountHolderName || undefined,
          },
        };
        break;
      case "statutory":
        payload = {
          pfOptIn: form.pfOptIn,
          statutoryInfo: {
            pan: form.pan || undefined,
            pfStatus: form.pfStatus || undefined,
            pfUan: form.pfUan || undefined,
            professionalTax: form.professionalTax || undefined,
            lwfStatus: form.lwfStatus || undefined,
            esicStatus: form.esicStatus || undefined,
            esicIpNumber: form.esicIpNumber || undefined,
          },
        };
        break;
      case "other":
        payload = {
          otherInfo: {
            phoneNumber: form.phoneNumber || undefined,
            gender: form.gender || undefined,
            dateOfBirth: form.dateOfBirth || undefined,
          },
        };
        break;
      case "role":
        payload = {
          role: form.role || undefined,
        };
        break;
    }

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Failed to update");
        return;
      }

      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-800 hover:bg-neutral-50"
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">
                Edit{" "}
                {{
                  basic: "basic information",
                  compensation: "compensation & perquisites",
                  leaves: "leaves & attendance",
                  pastPayroll: "past payroll",
                  payment: "payment information",
                  statutory: "statutory information",
                  other: "other information",
                  role: "user roles & permissions",
                }[section]}
              </h4>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-neutral-500 hover:text-neutral-800"
              >
                ✕
              </button>
            </div>

            {error && (
              <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              {section === "basic" && (
                <>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Profile photo URL</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.avatarUrl || ""}
                      onChange={(e) => update("avatarUrl", e.target.value)}
                      placeholder="Paste a public image URL (optional)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">
                      Associated with <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={
                        form.assignedProduct
                          ? `product:${form.assignedProduct}`
                          : form.assignedService
                          ? `service:${form.assignedService}`
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm((prev: any) => {
                          if (!value) {
                            // Explicitly clear both so DB gets null
                            return {
                              ...prev,
                              assignedProduct: null,
                              assignedService: null,
                            };
                          }
                          if (value.startsWith("product:")) {
                            return {
                              ...prev,
                              assignedProduct: value.replace("product:", ""),
                              assignedService: null,
                            };
                          }
                          if (value.startsWith("service:")) {
                            return {
                              ...prev,
                              assignedProduct: null,
                              assignedService: value.replace("service:", ""),
                            };
                          }
                          return prev;
                        });
                      }}
                      disabled={optionsLoading}
                      required
                    >
                      <option value="">Select product or service</option>
                      {productOptions.length > 0 && (
                        <optgroup label="Products">
                          {productOptions.map((name) => (
                            <option key={name} value={`product:${name}`}>
                              {name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {serviceOptions.length > 0 && (
                        <optgroup label="Services">
                          {serviceOptions.map((name) => (
                            <option key={name} value={`service:${name}`}>
                              {name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      * At least one (Product or Service) is required
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Name</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Email</label>
                    <input
                      type="email"
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Title</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Department</label>
                    {departmentOptions.length > 0 ? (
                      <select
                        className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        value={form.department || ""}
                        onChange={(e) => update("department", e.target.value)}
                        disabled={optionsLoading}
                      >
                        <option value="">Select department</option>
                        {departmentOptions.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        value={form.department}
                        onChange={(e) => update("department", e.target.value)}
                        placeholder="Add departments in Settings → Workspace policy"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Profile Slug</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">/@</span>
                      <input
                        className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        value={form.profileSlug || ""}
                        onChange={(e) => update("profileSlug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                        placeholder="e.g. aman-sharma"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Public profile URL: /@slug</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Location</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.location}
                      onChange={(e) => update("location", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Manager</label>
                    <select
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={
                        employeeOptions.some((e) => e.id === form.manager)
                          ? form.manager
                          : employeeOptions.find((e) => e.name === form.manager)?.id ?? ""
                      }
                      onChange={(e) => update("manager", e.target.value)}
                      disabled={optionsLoading}
                    >
                      <option value="">None</option>
                      {employeeOptions.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Employee ID</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.employeeId}
                      onChange={(e) => update("employeeId", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Date of joining</label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.dateOfHiring || ""}
                      onChange={(e) => update("dateOfHiring", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="edit-isOutsider"
                      checked={!!form.isOutsider}
                      onChange={(e) => update("isOutsider", e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="edit-isOutsider" className="text-neutral-700 font-medium">
                      Outsider (Restricted Access)
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-neutral-700">Work Start Time</label>
                      <input
                        type="time"
                        className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        value={form.workStartTime || ""}
                        onChange={(e) => update("workStartTime", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-neutral-700">Work End Time</label>
                      <input
                        type="time"
                        className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        value={form.workEndTime || ""}
                        onChange={(e) => update("workEndTime", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {section === "compensation" && (
                <>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Annual salary (₹)</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.annualSalary}
                      onChange={(e) => update("annualSalary", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">
                      Number of bonuses
                    </label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.numberOfBonuses}
                      onChange={(e) =>
                        update("numberOfBonuses", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">
                      Current advance salary (₹)
                    </label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.currentAdvanceSalary}
                      onChange={(e) =>
                        update("currentAdvanceSalary", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">
                      Advance salary EMI (₹)
                    </label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.advanceSalaryEmi}
                      onChange={(e) =>
                        update("advanceSalaryEmi", e.target.value)
                      }
                    />
                  </div>
                </>
              )}

              {section === "leaves" && (
                <>
                  <div className="space-y-1">
                    <label className="text-neutral-700">
                      Casual leave balance
                    </label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.casualLeaveBalance}
                      onChange={(e) =>
                        update("casualLeaveBalance", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">
                      Casual leave total
                    </label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.casualLeaveTotal}
                      onChange={(e) =>
                        update("casualLeaveTotal", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">
                      Sick leave balance
                    </label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.sickLeaveBalance}
                      onChange={(e) =>
                        update("sickLeaveBalance", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Sick leave total</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.sickLeaveTotal}
                      onChange={(e) =>
                        update("sickLeaveTotal", e.target.value)
                      }
                    />
                  </div>
                </>
              )}

              {section === "pastPayroll" && (
                <>
                  <div className="space-y-1">
                    <label className="text-neutral-700">
                      Taxable salary (₹)
                    </label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.taxableSalary}
                      onChange={(e) =>
                        update("taxableSalary", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Exemption (₹)</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.exemption}
                      onChange={(e) => update("exemption", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">
                      TDS deducted (₹)
                    </label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.tdsDeducted}
                      onChange={(e) => update("tdsDeducted", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">
                      Previous employer taxable salary (₹)
                    </label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.prevEmployerTaxableSalary}
                      onChange={(e) =>
                        update("prevEmployerTaxableSalary", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">
                      Previous employer TDS deducted (₹)
                    </label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.prevEmployerTdsDeducted}
                      onChange={(e) =>
                        update("prevEmployerTdsDeducted", e.target.value)
                      }
                    />
                  </div>
                </>
              )}

              {section === "payment" && (
                <>
                  <div className="space-y-1">
                    <label className="text-neutral-700">IFSC code</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.ifscCode}
                      onChange={(e) => update("ifscCode", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Account number</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.accountNumber}
                      onChange={(e) =>
                        update("accountNumber", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">
                      Account holder name
                    </label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.accountHolderName}
                      onChange={(e) =>
                        update("accountHolderName", e.target.value)
                      }
                    />
                  </div>
                </>
              )}

              {section === "statutory" && (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="section-pfOptIn"
                      checked={form.pfOptIn !== false}
                      onChange={(e) => update("pfOptIn", e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="section-pfOptIn" className="text-neutral-700">
                      Opted into EPF/PF (PF deduction in payslip)
                    </label>
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">PAN</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.pan}
                      onChange={(e) => update("pan", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">PF status</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.pfStatus}
                      onChange={(e) => update("pfStatus", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">PF UAN</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.pfUan}
                      onChange={(e) => update("pfUan", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Professional tax</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.professionalTax}
                      onChange={(e) =>
                        update("professionalTax", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">LWF status</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.lwfStatus}
                      onChange={(e) => update("lwfStatus", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">ESIC status</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.esicStatus}
                      onChange={(e) => update("esicStatus", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">ESIC IP number</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.esicIpNumber}
                      onChange={(e) => update("esicIpNumber", e.target.value)}
                    />
                  </div>
                </>
              )}

              {section === "other" && (
                <>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Phone number</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.phoneNumber}
                      onChange={(e) => update("phoneNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Gender</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.gender}
                      onChange={(e) => update("gender", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-700">Date of birth</label>
                    <input
                      className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={form.dateOfBirth}
                      onChange={(e) => update("dateOfBirth", e.target.value)}
                    />
                  </div>
                </>
              )}

              {section === "role" && (
                <div className="space-y-1">
                  <label className="text-neutral-700">Role</label>
                  <input
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                    placeholder="e.g. Admin, Intern, Part-Time"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

