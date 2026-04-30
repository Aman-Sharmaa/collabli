"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, Upload, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditEvent() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    address: "",
    description: "",
    aboutEvent: "",
    themeColor: "#3f2b4f",
    textColor: "#ffffff",
    backgroundStyle: "solid",
    eventType: "Offline",
    isPublicForm: false,
    photoUrl: "",
    googleMapUrl: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;
    
    fetch(`/api/events/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.event) {
          const ev = data.event;
          let formattedDate = "";
          if (ev.date) {
            const d = new Date(ev.date);
            formattedDate = d.toISOString().split('T')[0];
          }
          
          setFormData({
            name: ev.name || "",
            slug: ev.slug || "",
            date: formattedDate,
            startTime: ev.startTime || "",
            endTime: ev.endTime || "",
            location: ev.location || "",
            address: ev.address || "",
            description: ev.description || "",
            aboutEvent: ev.aboutEvent || "",
            themeColor: ev.themeColor || "#3f2b4f",
            textColor: ev.textColor || "#ffffff",
            backgroundStyle: ev.backgroundStyle || "solid",
            eventType: ev.eventType || "Offline",
            isPublicForm: ev.isPublicForm || false,
            photoUrl: ev.photoUrl || "",
            googleMapUrl: ev.googleMapUrl || "",
          });
          setTicketTypes(ev.ticketTypes || []);
        }
      })
      .catch((err) => {
        toast.error("Failed to load event details");
      })
      .finally(() => {
        setFetching(false);
      });
  }, [slug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: "", price: 0, requiresApproval: false, description: "" }]);
  };

  const handleTicketChange = (index: number, field: string, value: any) => {
    const newTickets = [...ticketTypes];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setTicketTypes(newTickets);
  };

  const removeTicket = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/events/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload");
      setFormData(prev => ({ ...prev, photoUrl: data.url }));
      toast.success("Image uploaded!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/events/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, ticketTypes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to edit event");

      toast.success("Event updated successfully");
      router.push(`/dashboard/events/${formData.slug}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/events/${slug}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
            <p className="text-muted-foreground mt-1 text-sm">{formData.name}</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
            <CardDescription>Enter the primary information for your event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Event Name *</Label>
                <Input name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Notion Delhi-NCR Meetup" />
              </div>
              <div className="space-y-2">
                <Label>URL Slug *</Label>
                <Input name="slug" required value={formData.slug} onChange={handleChange} placeholder="e.g. notion-delhi-meetup" />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={formData.eventType} onValueChange={(val) => setFormData(prev => ({...prev, eventType: val as any}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Offline">Offline / In-Person</SelectItem>
                    <SelectItem value="Online">Online / Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox 
                  id="isPublicForm" 
                  checked={formData.isPublicForm} 
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, isPublicForm: !!checked}))} 
                />
                <Label htmlFor="isPublicForm" className="cursor-pointer font-semibold">
                  Standalone Form Mode <span className="text-xs text-muted-foreground block font-normal">(Hides date, time and location for general detail collection)</span>
                </Label>
              </div>
            </div>

            {!formData.isPublicForm && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-4 border border-muted">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input name="date" type="date" required={!formData.isPublicForm} value={formData.date} onChange={handleChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input name="startTime" type="time" value={formData.startTime} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input name="endTime" type="time" value={formData.endTime} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{formData.eventType === "Online" ? "Meeting Platform (e.g. Zoom)" : "Venue Name"}</Label>
                    <Input name="location" value={formData.location} onChange={handleChange} placeholder={formData.eventType === "Online" ? "e.g. Google Meet" : "e.g. Register to See Address"} />
                  </div>
                  <div className="space-y-2">
                    <Label>{formData.eventType === "Online" ? "Meeting Link" : "Full Address"}</Label>
                    <Input name="address" value={formData.address} onChange={handleChange} placeholder={formData.eventType === "Online" ? "https://..." : "e.g. Noida, Uttar Pradesh"} />
                  </div>
                </div>
                {formData.eventType === "Offline" && (
                  <div className="space-y-2">
                    <Label>Google Maps Link</Label>
                    <Input name="googleMapUrl" value={formData.googleMapUrl} onChange={handleChange} placeholder="https://goo.gl/maps/..." />
                    <p className="text-[10px] text-muted-foreground italic">Important: This link will be used for the "View on Maps" button on the event page.</p>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input name="description" value={formData.description} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>About Event (Detailed)</Label>
              <Textarea 
                name="aboutEvent" 
                value={formData.aboutEvent} 
                onChange={handleChange} 
                className="min-h-[150px]"
                placeholder="Welcome to the first-ever Notion meetup..."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Theme Color</Label>
                <div className="flex items-center gap-2">
                  <Input name="themeColor" type="color" value={formData.themeColor} onChange={handleChange} className="w-14 h-10 p-1" />
                  <span className="text-sm text-muted-foreground">{formData.themeColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex items-center gap-2">
                  <Input name="textColor" type="color" value={formData.textColor} onChange={handleChange} className="w-14 h-10 p-1" />
                  <span className="text-sm text-muted-foreground">{formData.textColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Event Cover Photo</Label>
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" className="relative cursor-pointer" disabled={uploadingImage}>
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {uploadingImage ? "Uploading..." : "Upload Photo"}
                    <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                  </Button>
                  {formData.photoUrl && <img src={formData.photoUrl} alt="Cover" className="h-10 w-10 object-cover rounded shadow" />}
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 pt-2">
               <div className="space-y-2">
                <Label>Background Style</Label>
                <Select value={formData.backgroundStyle} onValueChange={(val) => setFormData(prev => ({...prev, backgroundStyle: val as any}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color (Theme Color)</SelectItem>
                    <SelectItem value="gradient">Gradient (Theme + Subtle Dark)</SelectItem>
                    <SelectItem value="aurora">Luma Aurora (Dynamic Particles)</SelectItem>
                    <SelectItem value="mesh">Mesh Gradient (Premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Registration / Ticket Types</CardTitle>
              <CardDescription>Add roles or ticket types people can register for.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
              <Plus className="h-4 w-4 mr-2" /> Add 
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg relative">
                <div className="flex-1 space-y-2">
                  <Label>Ticket Name</Label>
                  <Input 
                    value={ticket.name} 
                    onChange={(e) => handleTicketChange(index, "name", e.target.value)} 
                    placeholder="e.g. Builders or Partners" required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Description</Label>
                  <Input 
                    value={ticket.description} 
                    onChange={(e) => handleTicketChange(index, "description", e.target.value)} 
                    placeholder="Subtitle/info" 
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8 w-40">
                  <Checkbox 
                    id={`approval-${index}`} 
                    checked={ticket.requiresApproval} 
                    onCheckedChange={(checked) => handleTicketChange(index, "requiresApproval", !!checked)}
                  />
                  <Label htmlFor={`approval-${index}`}>Requires Approval</Label>
                </div>
                {ticketTypes.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => removeTicket(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

      </form>
    </div>
  );
}
