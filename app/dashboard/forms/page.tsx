"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Copy, FileText, Users, ExternalLink, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export default function FormsDashboard() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = () => {
    setLoading(true);
    fetch("/api/forms")
      .then((res) => res.json())
      .then((data) => {
        if (data.forms) setForms(data.forms);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`/api/forms/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete form");
      toast.success("Form deleted successfully");
      fetchForms();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms Hub</h1>
          <p className="text-muted-foreground mt-1 text-lg">Create and manage your public collection forms.</p>
        </div>
        <Link href="/dashboard/forms/new">
          <Button size="lg" className="h-12 px-6 shadow-sm gap-2">
            <Plus className="h-5 w-5" /> Create Form
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-[250px] bg-muted/50 border-dashed" />
          ))
        ) : forms.length === 0 ? (
          <div className="col-span-full text-center py-20 border rounded-xl bg-muted/20">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No forms found</h3>
            <p className="text-muted-foreground mb-4">Create your first form to start collecting details.</p>
            <Link href="/dashboard/forms/new">
              <Button variant="outline">Generate your first form</Button>
            </Link>
          </div>
        ) : (
          forms.map((form) => {
            const publicUrl = `${window.location.origin}/form/${form.slug}`;
            return (
              <Card key={form._id} className="flex flex-col border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="line-clamp-1">{form.name}</CardTitle>
                      <CardDescription className="line-clamp-1">/{form.slug}</CardDescription>
                    </div>
                    <Badge variant={form.isActive ? "default" : "secondary"} className="uppercase text-[10px]">
                      {form.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                   <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                    {form.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Entries</span>
                    </div>
                    <span className="text-sm font-bold">{form.submissionCount || 0}</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Public Link</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={publicUrl} className="h-8 text-xs bg-muted/50" />
                      <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => {
                        navigator.clipboard.writeText(publicUrl);
                        toast.success("Link copied!");
                      }}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex flex-wrap gap-2">
                  <Link href={`/dashboard/forms/${form.slug}`} className="flex-1 min-w-[120px]">
                    <Button variant="outline" className="w-full gap-2 h-9 text-[10px] font-bold uppercase tracking-tight">
                      <Eye className="h-3.5 w-3.5" /> Entries
                    </Button>
                  </Link>
                  <Link href={`/dashboard/forms/${form.slug}/edit`}>
                    <Button variant="outline" size="icon" className="h-9 w-9 text-blue-600 border-blue-100 hover:bg-blue-50" title="Edit Form">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  {form.submissionCount > 0 ? (
                    <Button variant="outline" size="icon" className="h-9 w-9 text-muted-foreground border-dashed opacity-50 cursor-not-allowed" title="Cannot delete form with submissions">
                       <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Dialog>
                        <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9 text-red-600 border-red-100 hover:bg-red-50" title="Delete Form">
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                            This will permanently delete the form <strong>{form.name}</strong>. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button 
                                onClick={() => handleDelete(form.slug)} 
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                            Delete Permanently
                            </Button>
                        </DialogFooter>
                        </DialogContent>
                    </Dialog>
                  )}
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" asChild title="Open Public Page">
                    <Link href={`/form/${form.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
