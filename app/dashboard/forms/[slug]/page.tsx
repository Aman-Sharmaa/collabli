"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, ArrowLeft, Filter, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function FormSubmissions({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch form details
    fetch(`/api/forms/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.form) setForm(data.form);
      });

    // Fetch submissions
    fetch(`/api/forms/${slug}/submissions`)
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions) setSubmissions(data.submissions);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const uniqueRoles = Array.from(new Set(submissions.map(s => s.role).filter(Boolean)));

  const filteredSubmissions = submissions.filter(s => {
    const matchesRole = roleFilter === "All" || s.role === roleFilter;
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.startupName?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const downloadCSV = () => {
    const headers = [
      "Name", "Email", "Phone", "Role", "LinkedIn", "Status", 
      "Startup Name", "Startup Website", "Startup About",
      "Investment Stage", "Ticket Size", "Portfolio URL",
      "Resume URL", "Experience Years", "Preferred Roles",
      "Company Name", "Job Title", "Submitted At"
    ];
    const csvContent = [
      headers.join(","),
      ...filteredSubmissions.map(s => [
        `"${s.name || ""}"`,
        `"${s.email || ""}"`,
        `"${s.phone || ""}"`,
        `"${s.role || ""}"`,
        `"${s.linkedin || ""}"`,
        `"${s.status || ""}"`,
        `"${s.startupName || ""}"`,
        `"${s.startupUrl || ""}"`,
        `"${(s.startupAbout || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${s.investmentStage || ""}"`,
        `"${s.ticketSize || ""}"`,
        `"${s.portfolioUrl || ""}"`,
        `"${s.resumeUrl || ""}"`,
        `"${s.experienceYears || ""}"`,
        `"${s.preferredRoles || ""}"`,
        `"${s.companyName || ""}"`,
        `"${s.jobTitle || ""}"`,
        `"${new Date(s.createdAt).toLocaleString()}"`,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `submissions_${slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/forms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{form?.name || "Loading..."}</h1>
          <p className="text-muted-foreground mt-1">View and filter responses for this form.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
          <div className="flex-1 max-w-sm relative">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="Search names or emails..." 
               className="pl-9 h-10" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                className="border rounded-md px-3 py-2 text-sm bg-background font-medium" 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role as string} value={role as string}>{role as string}</option>
                ))}
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-2 h-10">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-6">Loading responses...</TableCell></TableRow>
              ) : filteredSubmissions.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No responses found.</TableCell></TableRow>
              ) : (
                filteredSubmissions.map(s => (
                  <TableRow key={s._id}>
                    <TableCell>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-muted font-normal">{s.role}</Badge>
                      {s.role === "Founder" && s.startupName && (
                        <div className="text-xs text-blue-500 mt-1">{s.startupName}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "Approved" ? "default" : s.status === "Pending" ? "secondary" : "destructive"}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="outline" className="h-8 w-8 text-blue-600" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{s.name}'s Response</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4 text-sm">
                            <div className="space-y-4">
                                <DetailItem label="Full Name" value={s.name} />
                                <DetailItem label="Email" value={s.email} isEmail />
                                <DetailItem label="Phone" value={s.phone} />
                                <DetailItem label="Role" value={s.role} />
                                <DetailItem label="LinkedIn" value={s.linkedin} isUrl />
                            </div>
                            <div className="space-y-4">
                                {s.role === "Founder" && (
                                    <>
                                        <DetailItem label="Startup Name" value={s.startupName} />
                                        <DetailItem label="Website" value={s.startupUrl} isUrl />
                                        <div className="col-span-2">
                                            <span className="font-bold text-xs uppercase text-muted-foreground block mb-1">About Startup</span>
                                            <p className="bg-muted p-2.5 rounded-md text-xs whitespace-pre-wrap border italic">{s.startupAbout || "N/A"}</p>
                                        </div>
                                    </>
                                )}
                                {s.role === "Investor" && (
                                    <>
                                        <DetailItem label="Investment Stage" value={s.investmentStage} />
                                        <DetailItem label="Ticket Size" value={s.ticketSize} />
                                        <DetailItem label="Portfolio" value={s.portfolioUrl} isUrl />
                                    </>
                                )}
                                {(s.role === "Job Seeker" || s.role === "Student") && (
                                    <>
                                        <DetailItem label="Experience" value={s.experienceYears} />
                                        <DetailItem label="Target Roles" value={s.preferredRoles} />
                                        <DetailItem label="Resume" value={s.resumeUrl} isUrl labelOverride="View Resume" />
                                    </>
                                )}
                                {s.role === "Professional" && (
                                    <>
                                        <DetailItem label="Company" value={s.companyName} />
                                        <DetailItem label="Job Title" value={s.jobTitle} />
                                    </>
                                )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({ label, value, isUrl = false, isEmail = false, labelOverride }: { label: string, value: string, isUrl?: boolean, isEmail?: boolean, labelOverride?: string }) {
    return (
        <div className="border-b pb-1.5 flex flex-col">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{label}</span>
            <span className="font-medium truncate">
                {isUrl && value ? (
                    <a href={value} target="_blank" className="text-blue-500 hover:underline">{labelOverride || value}</a>
                ) : isEmail && value ? (
                    <a href={`mailto:${value}`} className="text-blue-500 hover:underline">{value}</a>
                ) : (
                    value || "N/A"
                )}
            </span>
        </div>
    );
}
