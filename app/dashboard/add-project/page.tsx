"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AddProjectPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [views, setViews] = useState("");
  const [impressions, setImpressions] = useState("");
  const [likes, setLikes] = useState("");
  const [shares, setShares] = useState("");

  useEffect(() => {
    void fetch("/api/collabli/auth/me")
      .then((r) => r.json())
      .then((d) => setRole(d.user?.role || null));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role !== "creator" && role !== "brand") {
      setMessage("Only creators and brands can add projects.");
      return;
    }
    setLoading(true);
    setMessage("");
    const endpoint =
      role === "creator" ? "/api/collabli/creator-profile" : "/api/collabli/brand-profile";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: {
          imageUrl: imageUrl.trim(),
          title: title.trim(),
          description: description.trim(),
          views: Number(views || 0),
          impressions: Number(impressions || 0),
          likes: Number(likes || 0),
          shares: Number(shares || 0),
        },
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMessage(data.message || "Could not save");
    router.push("/dashboard");
    router.refresh();
  }

  if (role === null) {
    return <div className="text-sm text-neutral-500">Loading…</div>;
  }

  if (role !== "creator" && role !== "brand") {
    return <p className="text-sm text-neutral-600">This page is for creator and brand accounts.</p>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Add project</h1>
        <p className="mt-1 text-sm text-neutral-600">Image URL, title, description, and performance stats.</p>
      </div>
      <Card className="border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle>New item</CardTitle>
          <CardDescription>Appends to your public profile grid.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="rounded-xl" placeholder="https://…" />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Views</Label>
                <Input type="number" value={views} onChange={(e) => setViews(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Impressions</Label>
                <Input type="number" value={impressions} onChange={(e) => setImpressions(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Likes</Label>
                <Input type="number" value={likes} onChange={(e) => setLikes(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Shares</Label>
                <Input type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="rounded-xl bg-yellow-400 font-semibold text-black hover:bg-yellow-500">
              {loading ? "Saving…" : "Save project"}
            </Button>
            {message ? <p className="text-sm text-red-600">{message}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
