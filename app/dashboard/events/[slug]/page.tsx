"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, ExternalLink, X, Edit, Trash2, Eye, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ManageEvent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("All");

  const fetchRegistrations = async () => {
    try {
      const res = await fetch(`/api/events/${slug}/registrations`);
      const data = await res.json();
      if (res.ok) {
        setRegistrations(data.registrations);
      }
    } catch {}
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${slug}`);
        const data = await res.json();
        if (data.event) {
          setEvent(data.event);
          await fetchRegistrations();
        } else {
          toast.error("Event not found");
          router.push("/dashboard/events");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/events/${slug}/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Registration ${newStatus}`);
        fetchRegistrations();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/events/${slug}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete event");
      toast.success("Event deleted successfully");
      router.push("/dashboard/events");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading event details...</div>;
  if (!event) return null;

  const approvedCount = registrations.filter(r => r.status === "Approved").length;
  const pendingCount = registrations.filter(r => r.status === "Pending").length;

  const uniqueRoles = Array.from(new Set(registrations.map(r => r.role || "Unknown").filter(Boolean)));
  const filteredRegistrations = roleFilter === "All" 
    ? registrations 
    : registrations.filter(r => (r.role || "Unknown") === roleFilter);
  const downloadCSV = () => {
    const headers = [
      "Name", "Email", "Phone", "Role", "LinkedIn", "Ticket Type", "Status", 
      "Startup Name", "Startup Website", "Startup About",
      "Investment Stage", "Ticket Size", "Portfolio URL",
      "Resume URL", "Experience Years", "Preferred Roles",
      "Company Name", "Job Title"
    ];
    const csvContent = [
      headers.join(","),
      ...filteredRegistrations.map(reg => [
        `"${reg.name || ""}"`,
        `"${reg.email || ""}"`,
        `"${reg.phone || ""}"`,
        `"${reg.role || ""}"`,
        `"${reg.linkedin || ""}"`,
        `"${reg.ticketType || ""}"`,
        `"${reg.status || ""}"`,
        `"${reg.startupName || ""}"`,
        `"${reg.startupUrl || ""}"`,
        `"${(reg.startupAbout || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${reg.investmentStage || ""}"`,
        `"${reg.ticketSize || ""}"`,
        `"${reg.portfolioUrl || ""}"`,
        `"${reg.resumeUrl || ""}"`,
        `"${reg.experienceYears || ""}"`,
        `"${reg.preferredRoles || ""}"`,
        `"${reg.companyName || ""}"`,
        `"${reg.jobTitle || ""}"`,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `attendees_${event.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/events">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={event.isPublicForm ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}>
                {event.isPublicForm ? "Public Link" : "Event"}
              </Badge>
              <p className="text-muted-foreground text-sm">/{event.slug}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/event/${event.slug}`} target="_blank">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" /> View Public
            </Button>
          </Link>
          <Link href={`/dashboard/events/${slug}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDeleteEvent} className="gap-2">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registrations</CardTitle>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={downloadCSV} className="mr-2">
               <Download className="mr-2 h-4 w-4" /> Download CSV
             </Button>
             <span className="text-sm text-muted-foreground mr-2">Filter by Role:</span>
             <select 
               className="border rounded px-2 py-1 text-sm bg-background"
               value={roleFilter}
               onChange={(e) => setRoleFilter(e.target.value)}
             >
               <option value="All">All Roles</option>
               {uniqueRoles.map(role => (
                 <option key={role as string} value={role as string}>{role as string}</option>
               ))}
             </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role / LinkedIn</TableHead>
                <TableHead>Ticket Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No registrations found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegistrations.map((reg) => (
                  <TableRow key={reg._id}>
                    <TableCell className="font-medium">{reg.name}</TableCell>
                    <TableCell>{reg.email}</TableCell>
                    <TableCell>
                      <div className="text-sm">{reg.role}</div>
                      {reg.linkedin && (
                        <a href={reg.linkedin} target="_blank" className="text-xs text-blue-500 hover:underline">LinkedIn</a>
                      )}
                    </TableCell>
                    <TableCell>{reg.ticketType}</TableCell>
                    <TableCell>
                      <Badge variant={reg.status === 'Approved' ? 'default' : reg.status === 'Rejected' ? 'destructive' : 'secondary'}>
                        {reg.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="outline" className="h-8 w-8 text-blue-600" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{reg.name}'s Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3 mt-4 text-sm">
                            <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Name:</span> <span className="col-span-2">{reg.name}</span></div>
                            <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Email:</span> <span className="col-span-2 break-all">{reg.email}</span></div>
                            <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Phone:</span> <span className="col-span-2">{reg.phone || "N/A"}</span></div>
                            <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Role:</span> <span className="col-span-2">{reg.role}</span></div>
                            <div className="grid grid-cols-3 border-b pb-2">
                              <span className="font-semibold text-muted-foreground">LinkedIn:</span> 
                              <span className="col-span-2">{reg.linkedin ? <a href={reg.linkedin} target="_blank" className="text-blue-500 hover:underline">Profile Link</a> : "N/A"}</span>
                            </div>
                            {reg.role === "Founder" && (
                              <div className="space-y-3 pt-2">
                                <h5 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Startup Details</h5>
                                <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Startup:</span> <span className="col-span-2">{reg.startupName || "N/A"}</span></div>
                                <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Website:</span> <span className="col-span-2">{reg.startupUrl ? <a href={reg.startupUrl} target="_blank" className="text-blue-500 hover:underline text-xs">Link</a> : "N/A"}</span></div>
                                <div className="grid grid-cols-1 pt-1 space-y-1">
                                  <span className="font-semibold text-muted-foreground">About Startup:</span> 
                                  <p className="bg-muted p-3 rounded-md text-xs whitespace-pre-wrap">{reg.startupAbout || "N/A"}</p>
                                </div>
                              </div>
                            )}
                            {reg.role === "Investor" && (
                              <div className="space-y-3 pt-2">
                                <h5 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Investor Details</h5>
                                <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Stage:</span> <span className="col-span-2">{reg.investmentStage || "N/A"}</span></div>
                                <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Ticket Size:</span> <span className="col-span-2">{reg.ticketSize || "N/A"}</span></div>
                                <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Portfolio:</span> <span className="col-span-2">{reg.portfolioUrl ? <a href={reg.portfolioUrl} target="_blank" className="text-blue-500 hover:underline text-xs">Link</a> : "N/A"}</span></div>
                              </div>
                            )}
                            {reg.role === "Job Seeker" && (
                              <div className="space-y-3 pt-2">
                                <h5 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Career Details</h5>
                                <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Experience:</span> <span className="col-span-2">{reg.experienceYears || "N/A"}</span></div>
                                <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Target Roles:</span> <span className="col-span-2">{reg.preferredRoles || "N/A"}</span></div>
                                <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Resume:</span> <span className="col-span-2">{reg.resumeUrl ? <a href={reg.resumeUrl} target="_blank" className="text-blue-500 hover:underline text-xs">View Resume</a> : "N/A"}</span></div>
                              </div>
                            )}
                            {reg.role === "Professional" && (
                              <div className="space-y-3 pt-2">
                                <h5 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Professional Details</h5>
                                <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Company:</span> <span className="col-span-2">{reg.companyName || "N/A"}</span></div>
                                <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground">Job Title:</span> <span className="col-span-2">{reg.jobTitle || "N/A"}</span></div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {reg.status === 'Pending' && (
                        <>
                          <Button size="icon" variant="outline" className="h-8 w-8 text-green-600" onClick={() => updateStatus(reg._id, 'Approved')}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8 text-red-600" onClick={() => updateStatus(reg._id, 'Rejected')}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {reg.status === 'Approved' && (
                         <Button size="icon" variant="outline" className="h-8 w-8 text-red-600" onClick={() => updateStatus(reg._id, 'Rejected')}>
                            <X className="h-4 w-4" />
                         </Button>
                      )}
                      {reg.status === 'Rejected' && (
                         <Button size="icon" variant="outline" className="h-8 w-8 text-green-600" onClick={() => updateStatus(reg._id, 'Approved')}>
                            <Check className="h-4 w-4" />
                         </Button>
                      )}
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
