"use client";

import { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

import { FileText, Lock } from "lucide-react";

export default function RequestAccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileName = searchParams?.get("name") || "this file";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "granted">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/drive/request-access/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to request access");
      }

      setStatus(data.status);
      if (data.status === "granted") {
        toast.success("Access granted! Redirecting to file...");
        setTimeout(() => {
          router.replace(`/api/drive/f/${id}/${encodeURIComponent(fileName)}`);
        }, 1500);
      } else {
        toast.success("Request sent to the owner");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-sm border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Request Access</CardTitle>
          <CardDescription className="mt-2 text-sm">
            You need permission to view <span className="font-medium text-foreground">{fileName}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          {status === "idle" && (
            <form onSubmit={onSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="req-name">Name</Label>
                <Input
                  id="req-name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="req-email">Email address</Label>
                <Input
                  id="req-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-11"
                  required
                />
              </div>

              <Button type="submit" className="w-full rounded-xl h-11" disabled={loading}>
                {loading ? "Sending Request..." : "Request Access"}
              </Button>
            </form>
          )}

          {status === "pending" && (
            <div className="text-center py-6 space-y-3 mt-2 rounded-xl bg-orange-50 border border-orange-100 flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              <div>
                <p className="font-medium text-orange-800">Request Pending</p>
                <p className="text-sm text-orange-600/80 mt-1 px-4">
                  The owner has been notified. You can check back with this email once they approve.
                </p>
              </div>
            </div>
          )}

          {status === "granted" && (
            <div className="text-center py-6 space-y-3 mt-2 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center">
              <FileText className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800">Access Granted</p>
                <p className="text-sm text-emerald-600/80 mt-1">
                  Redirecting to your file...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
