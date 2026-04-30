"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";

interface PublicFormProps {
  formSlug: string;
  onSuccess?: () => void;
}

export function PublicForm({ formSlug, onSuccess }: PublicFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    linkedin: "",
    startupName: "",
    startupAbout: "",
    startupUrl: "",
    investmentStage: "",
    ticketSize: "",
    portfolioUrl: "",
    resumeUrl: "",
    experienceYears: "",
    preferredRoles: "",
    companyName: "",
    jobTitle: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/forms/${formSlug}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setSubmitted(true);
      toast.success("Successfully submitted!");
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="bg-emerald-100 p-4 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold">Thank You!</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
            Your response has been recorded successfully.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)}>Submit another response</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone Number *</Label>
          <Input name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="+91 ..." />
        </div>
        <div className="space-y-2">
          <Label>Role / Category *</Label>
          <Select required value={formData.role} onValueChange={(val) => setFormData(p => ({ ...p, role: val }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select your primary role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Founder">Founder</SelectItem>
              <SelectItem value="Investor">Investor</SelectItem>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Job Seeker">Job Seeker</SelectItem>
              <SelectItem value="Professional">Working Professional</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>LinkedIn Profile URL</Label>
        <Input name="linkedin" type="url" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
      </div>

      {formData.role === "Founder" && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5 space-y-4 shadow-inner">
          <h4 className="font-semibold text-zinc-900 border-b pb-2">Startup Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Startup Name *</Label>
              <Input name="startupName" required value={formData.startupName} onChange={handleChange} placeholder="e.g. Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label>Startup Website URL</Label>
              <Input name="startupUrl" type="url" value={formData.startupUrl} onChange={handleChange} placeholder="https://" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>About Startup *</Label>
            <Textarea name="startupAbout" required value={formData.startupAbout} onChange={handleChange} placeholder="What does your startup do?" className="min-h-[80px] resize-y" />
          </div>
        </div>
      )}

      {formData.role === "Investor" && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5 space-y-4 shadow-inner">
          <h4 className="font-semibold text-zinc-900 border-b pb-2">Investor Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Investment Stage *</Label>
              <Input name="investmentStage" required value={formData.investmentStage} onChange={handleChange} placeholder="e.g. Seed, Series A" />
            </div>
            <div className="space-y-2">
              <Label>Typical Ticket Size *</Label>
              <Input name="ticketSize" required value={formData.ticketSize} onChange={handleChange} placeholder="e.g. $50k - $200k" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Portfolio URL / LinkedIn</Label>
            <Input name="portfolioUrl" type="url" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://" />
          </div>
        </div>
      )}

      {(formData.role === "Job Seeker" || formData.role === "Student") && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5 space-y-4 shadow-inner">
          <h4 className="font-semibold text-zinc-900 border-b pb-2">{formData.role} Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Experience / Education Stage *</Label>
              <Input name="experienceYears" required value={formData.experienceYears} onChange={handleChange} placeholder="e.g. 3+ years or Final Year Student" />
            </div>
            <div className="space-y-2">
              <Label>Preferred Roles / Interests *</Label>
              <Input name="preferredRoles" required value={formData.preferredRoles} onChange={handleChange} placeholder="e.g. Frontend Dev, Product Manager" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Resume / Profile Link (Google Drive/Dropbox) *</Label>
            <Input name="resumeUrl" type="url" required value={formData.resumeUrl} onChange={handleChange} placeholder="https://" />
          </div>
        </div>
      )}

      {formData.role === "Professional" && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5 space-y-4 shadow-inner">
          <h4 className="font-semibold text-zinc-900 border-b pb-2">Professional Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input name="companyName" required value={formData.companyName} onChange={handleChange} placeholder="e.g. Google, Stripe" />
            </div>
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input name="jobTitle" required value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Software Engineer" />
            </div>
          </div>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {loading ? "Submitting..." : "Submit Response"}
      </Button>
    </form>
  );
}
