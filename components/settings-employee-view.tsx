"use client";

import { User, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EmployeeDetails = {
  name: string;
  email: string;
  title?: string;
  department?: string;
  type?: string;
  location?: string;
  phoneNumber?: string;
  dateOfHiring?: string;
  employeeId?: number;
};

type Props = {
  employee: EmployeeDetails;
};

export function SettingsEmployeeView({ employee }: Props) {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b pb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your profile information. Contact your administrator to update any details.
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Lock className="h-4 w-4" />
          <span>Read-only</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" /> Profile
          </CardTitle>
          <CardDescription>
            Your details as recorded in the organisation. Changes must be made by an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emp-name">Name</Label>
              <Input
                id="emp-name"
                value={employee.name ?? ""}
                readOnly
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-email">Email</Label>
              <Input
                id="emp-email"
                type="email"
                value={employee.email ?? ""}
                readOnly
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emp-phone">Phone</Label>
              <Input
                id="emp-phone"
                value={employee.phoneNumber ?? ""}
                readOnly
                disabled
                className="bg-muted/50 cursor-not-allowed"
                placeholder="—"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-title">Title</Label>
              <Input
                id="emp-title"
                value={employee.title ?? ""}
                readOnly
                disabled
                className="bg-muted/50 cursor-not-allowed"
                placeholder="—"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emp-department">Department</Label>
              <Input
                id="emp-department"
                value={employee.department ?? ""}
                readOnly
                disabled
                className="bg-muted/50 cursor-not-allowed"
                placeholder="—"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-type">Type</Label>
              <Input
                id="emp-type"
                value={employee.type ?? ""}
                readOnly
                disabled
                className="bg-muted/50 cursor-not-allowed"
                placeholder="—"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emp-location">Location</Label>
              <Input
                id="emp-location"
                value={employee.location ?? ""}
                readOnly
                disabled
                className="bg-muted/50 cursor-not-allowed"
                placeholder="—"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-id">Employee ID</Label>
              <Input
                id="emp-id"
                value={employee.employeeId != null ? String(employee.employeeId) : ""}
                readOnly
                disabled
                className="bg-muted/50 cursor-not-allowed"
                placeholder="—"
              />
            </div>
          </div>
          {employee.dateOfHiring && (
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="emp-doh">Date of hiring</Label>
              <Input
                id="emp-doh"
                value={employee.dateOfHiring}
                readOnly
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
