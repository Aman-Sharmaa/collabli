"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Plus, ArrowRight, Eye, Download, Copy, Link as LinkIcon, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

export default function EventsDashboard() {
  const [activeTab, setActiveTab] = useState<"events" | "people">("events");
  const [events, setEvents] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All"); // All, Events, Forms

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "people" && people.length === 0) {
      setPeopleLoading(true);
      fetch("/api/events/registrations")
        .then((res) => res.json())
        .then((data) => {
          if (data.registrations) setPeople(data.registrations);
        })
        .finally(() => setPeopleLoading(false));
    }
  }, [activeTab, people.length]); // Added people.length to dependency array to prevent re-fetching if people array is empty but tab is not active

  const uniqueRoles = Array.from(new Set(people.map(p => p.role || "Unknown").filter(Boolean)));
  const filteredPeople = people.filter(p => {
    const matchesRole = roleFilter === "All" || (p.role || "Unknown") === roleFilter;
    const isForm = p.eventId?.isPublicForm;
    const matchesSource = sourceFilter === "All" || (sourceFilter === "Forms" ? isForm : !isForm);
    return matchesRole && matchesSource;
  });

  const downloadCSV = () => {
    const headers = [
      "Event Name", "Attendee Name", "Email", "Phone", "Role", "LinkedIn", "Ticket Type", "Status", 
      "Startup Name", "Startup Website", "Startup About",
      "Investment Stage", "Ticket Size", "Portfolio URL",
      "Resume URL", "Experience Years", "Preferred Roles",
      "Company Name", "Job Title"
    ];
    const csvContent = [
      headers.join(","),
      ...filteredPeople.map(person => [
        `"${person.eventId?.name || "Unknown Event"}"`,
        `"${person.name || ""}"`,
        `"${person.email || ""}"`,
        `"${person.phone || ""}"`,
        `"${person.role || ""}"`,
        `"${person.linkedin || ""}"`,
        `"${person.ticketType || ""}"`,
        `"${person.status || ""}"`,
        `"${person.startupName || ""}"`,
        `"${person.startupUrl || ""}"`,
        `"${(person.startupAbout || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${person.investmentStage || ""}"`,
        `"${person.ticketSize || ""}"`,
        `"${person.portfolioUrl || ""}"`,
        `"${person.resumeUrl || ""}"`,
        `"${person.experienceYears || ""}"`,
        `"${person.preferredRoles || ""}"`,
        `"${person.companyName || ""}"`,
        `"${person.jobTitle || ""}"`,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `all_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events Hub</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your events and attendees.</p>
        </div>
        <Link href="/dashboard/events/new">
          <Button size="lg" className="h-12 px-6 shadow-sm gap-2">
            <Plus className="h-5 w-5" /> Create Event
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4 border-b pb-4">
        <Button 
          variant={activeTab === "events" ? "default" : "outline"} 
          onClick={() => setActiveTab("events")}
          className="rounded-full"
        >
          Events
        </Button>
        <Button 
          variant={activeTab === "people" ? "default" : "outline"} 
          onClick={() => setActiveTab("people")}
          className="rounded-full"
        >
          People
        </Button>
      </div>

      {activeTab === "events" && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse h-[250px] bg-muted/50 border-dashed" />
              ))}
            </div>
          ) : events.filter(e => !e.isPublicForm).length === 0 ? (
            <div className="text-center py-20 border rounded-xl bg-muted/20">
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
              <Link href="/dashboard/events/new">
                <Button variant="outline">Create your first event</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.filter(e => !e.isPublicForm).map((event) => (
                <Card key={event._id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{event.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{event.slug}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {`${new Date(event.date).toLocaleDateString()} ${event.startTime ? `• ${event.startTime}` : ""}`}
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        {event.ticketTypes?.length || 0} Ticket Types
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t bg-muted/20 mt-auto">
                    <Link href={`/dashboard/events/${event.slug}`} className="w-full">
                      <Button variant="secondary" className="w-full bg-background hover:bg-muted">
                        Manage Event <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "people" && (
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
            <div>
              <CardTitle>All Attendees</CardTitle>
              <CardDescription>View everyone registered across all your events and forms.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-2">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">Role:</span>
                <select className="border rounded-md px-2 py-1 text-sm bg-background" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="All">All Roles</option>
                  {uniqueRoles.map(role => (
                    <option key={role as string} value={role as string}>{role as string}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">Source:</span>
                <select className="border rounded-md px-2 py-1 text-sm bg-background" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                  <option value="All">All Sources</option>
                  <option value="Events">Events Only</option>
                  <option value="Forms">Forms Only</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {peopleLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-6">Loading attendees...</TableCell></TableRow>
                ) : filteredPeople.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No attendees found.</TableCell></TableRow>
                ) : (
                  filteredPeople.map(person => (
                    <TableRow key={person._id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {person.eventId?.name || "Unknown Event"}
                          {person.eventId?.isPublicForm && (
                            <Badge variant="outline" className="text-[10px] w-fit h-4 px-1 leading-none uppercase bg-purple-100 text-purple-700 border-purple-200">Form</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{person.name}</div>
                        <div className="text-xs text-muted-foreground">{person.email}</div>
                      </TableCell>
                      <TableCell>
                        <div>{person.role}</div>
                        {person.role === "Founder" && person.startupName && (
                          <div className="text-xs text-blue-500 mt-1">{person.startupName}</div>
                        )}
                      </TableCell>
                      <TableCell>{person.ticketType}</TableCell>
                      <TableCell>
                        <Badge variant={person.status === "Approved" ? "default" : person.status === "Pending" ? "secondary" : "destructive"}>
                          {person.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <Dialog>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="outline" className="h-8 w-8 text-blue-600" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{person.name}'s Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 mt-4 text-sm text-left">
                              <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Name:</span> <span className="col-span-2">{person.name}</span></div>
                              <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Email:</span> <span className="col-span-2 break-all">{person.email}</span></div>
                              <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Phone:</span> <span className="col-span-2">{person.phone || "N/A"}</span></div>
                              <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Role:</span> <span className="col-span-2">{person.role}</span></div>
                              <div className="grid grid-cols-3 border-b pb-2">
                                <span className="font-semibold text-muted-foreground w-max">LinkedIn:</span> 
                                <span className="col-span-2">{person.linkedin ? <a href={person.linkedin} target="_blank" className="text-blue-500 hover:underline">Profile Link</a> : "N/A"}</span>
                              </div>
                              {person.role === "Founder" && (
                                <div className="space-y-3 pt-2">
                                  <h5 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Startup Details</h5>
                                  <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Startup:</span> <span className="col-span-2">{person.startupName || "N/A"}</span></div>
                                  <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Website:</span> <span className="col-span-2">{person.startupUrl ? <a href={person.startupUrl} target="_blank" className="text-blue-500 hover:underline text-xs">Link</a> : "N/A"}</span></div>
                                  <div className="grid grid-cols-1 pt-1 space-y-1">
                                    <span className="font-semibold text-muted-foreground">About Startup:</span> 
                                    <p className="bg-muted p-3 rounded-md text-xs whitespace-pre-wrap">{person.startupAbout || "N/A"}</p>
                                  </div>
                                </div>
                              )}
                              {person.role === "Investor" && (
                                <div className="space-y-3 pt-2">
                                  <h5 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Investor Details</h5>
                                  <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Stage:</span> <span className="col-span-2">{person.investmentStage || "N/A"}</span></div>
                                  <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Ticket Size:</span> <span className="col-span-2">{person.ticketSize || "N/A"}</span></div>
                                  <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Portfolio:</span> <span className="col-span-2">{person.portfolioUrl ? <a href={person.portfolioUrl} target="_blank" className="text-blue-500 hover:underline text-xs">Link</a> : "N/A"}</span></div>
                                </div>
                              )}
                              {person.role === "Job Seeker" && (
                                <div className="space-y-3 pt-2">
                                  <h5 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Career Details</h5>
                                  <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Experience:</span> <span className="col-span-2">{person.experienceYears || "N/A"}</span></div>
                                  <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Target Roles:</span> <span className="col-span-2">{person.preferredRoles || "N/A"}</span></div>
                                  <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Resume:</span> <span className="col-span-2">{person.resumeUrl ? <a href={person.resumeUrl} target="_blank" className="text-blue-500 hover:underline text-xs">View Resume</a> : "N/A"}</span></div>
                                </div>
                              )}
                              {person.role === "Professional" && (
                                <div className="space-y-3 pt-2">
                                  <h5 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Professional Details</h5>
                                  <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Company:</span> <span className="col-span-2">{person.companyName || "N/A"}</span></div>
                                  <div className="grid grid-cols-3 border-b pb-2"><span className="font-semibold text-muted-foreground w-max">Job Title:</span> <span className="col-span-2">{person.jobTitle || "N/A"}</span></div>
                                </div>
                              )}
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
      )}
    </div>
  );
}
