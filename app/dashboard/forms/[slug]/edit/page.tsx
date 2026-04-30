"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditForm({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    aboutForm: "",
    themeColor: "#3f2b4f",
    textColor: "#ffffff",
    backgroundStyle: "solid",
    photoUrl: "",
    isActive: true,
  });

  useEffect(() => {
    fetch(`/api/forms/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.form) {
          const { name, slug, description, aboutForm, themeColor, textColor, backgroundStyle, photoUrl, isActive } = data.form;
          setFormData({ name, slug, description, aboutForm, themeColor, textColor, backgroundStyle, photoUrl, isActive });
        }
      })
      .finally(() => setFetching(false));
  }, [slug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/forms/upload", {
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
      const res = await fetch(`/api/forms/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update form");

      toast.success("Form updated successfully");
      router.push("/dashboard/forms");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-20 text-center animate-pulse">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Fetching form details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/forms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Form</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
            <CardDescription>Update your form's configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Form Name *</Label>
                <Input name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Startup Batch 2024 Application" />
              </div>
              <div className="space-y-2">
                <Label>URL Slug *</Label>
                <Input name="slug" required value={formData.slug} onChange={handleChange} placeholder="e.g. startup-apply" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input name="description" value={formData.description} onChange={handleChange} placeholder="A brief catchphrase for the form" />
            </div>
            <div className="space-y-2">
              <Label>About Form (Detailed)</Label>
              <Textarea 
                name="aboutForm" 
                value={formData.aboutForm} 
                onChange={handleChange} 
                className="min-h-[120px]"
                placeholder="Details about why people should fill this form..."
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
                <Label>Cover Photo / Banner</Label>
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
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.isActive ? "active" : "inactive"} onValueChange={(val) => setFormData(p => ({ ...p, isActive: val === "active" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Visible)</SelectItem>
                    <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={loading} className="px-10">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {loading ? "Saving Changes..." : "Update Form"}
          </Button>
        </div>
      </form>
    </div>
  );
}
