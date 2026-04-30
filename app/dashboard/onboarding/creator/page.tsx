"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLATFORMS = ["instagram", "youtube", "tiktok", "x", "other"] as const;

type SocialRow = { platform: (typeof PLATFORMS)[number]; profileUrl: string; followers: string; following: string };
type ProjectRow = {
  imageUrl: string;
  title: string;
  description: string;
  views: string;
  impressions: string;
  likes: string;
  shares: string;
};

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [publicHandle, setPublicHandle] = useState("");
  const [niche, setNiche] = useState("");
  const [platformsStr, setPlatformsStr] = useState("");
  const [audienceSize, setAudienceSize] = useState("");
  const [location, setLocation] = useState("");
  const [rate, setRate] = useState("");
  const [bio, setBio] = useState("");

  const [socials, setSocials] = useState<SocialRow[]>([
    { platform: "instagram", profileUrl: "", followers: "", following: "" },
  ]);
  const [projects, setProjects] = useState<ProjectRow[]>([
    { imageUrl: "", title: "", description: "", views: "", impressions: "", likes: "", shares: "" },
  ]);

  function addSocial() {
    setSocials((s) => [...s, { platform: "instagram", profileUrl: "", followers: "", following: "" }]);
  }
  function removeSocial(i: number) {
    setSocials((s) => s.filter((_, j) => j !== i));
  }
  function addProject() {
    setProjects((p) => [...p, { imageUrl: "", title: "", description: "", views: "", impressions: "", likes: "", shares: "" }]);
  }
  function removeProject(i: number) {
    setProjects((p) => p.filter((_, j) => j !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const platforms = platformsStr
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const socialLinks = socials
      .map((r) => ({
        platform: r.platform,
        profileUrl: r.profileUrl.trim(),
        followers: Number(r.followers || 0),
        following: Number(r.following || 0),
      }))
      .filter((r) => r.profileUrl.length > 0);

    const projectPayload = projects
      .map((p) => ({
        imageUrl: p.imageUrl.trim(),
        title: p.title.trim(),
        description: p.description.trim(),
        views: Number(p.views || 0),
        impressions: Number(p.impressions || 0),
        likes: Number(p.likes || 0),
        shares: Number(p.shares || 0),
      }))
      .filter((p) => p.title.length > 0);

    if (!publicHandle.trim()) {
      setLoading(false);
      return setMessage("Choose a public username (like Instagram).");
    }
    if (projectPayload.length === 0) {
      setLoading(false);
      return setMessage("Add at least one project or media item with a title.");
    }

    const res = await fetch("/api/collabli/creator-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicHandle,
        niche,
        platforms,
        audienceSize: Number(audienceSize || 0),
        location,
        rate: Number(rate || 0),
        bio,
        socialLinks,
        projects: projectPayload,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMessage(data.message || "Failed to save");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Finish your creator profile</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Add your public username, connect socials via URL (paste profile link — OAuth later), and showcase projects with
          stats.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Public username</CardTitle>
            <CardDescription>Your page will be <span className="font-mono text-neutral-800">/u/yourname</span> — same idea as Instagram.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="handle">Username</Label>
            <div className="flex max-w-md items-center gap-2">
              <span className="text-sm text-neutral-500">@</span>
              <Input
                id="handle"
                value={publicHandle}
                onChange={(e) => setPublicHandle(e.target.value.replace(/^@+/, ""))}
                placeholder="your_handle"
                className="rounded-xl border-neutral-200"
                autoComplete="username"
              />
            </div>
            <p className="text-xs text-neutral-500">3–30 characters: letters, numbers, underscores.</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>About you</CardTitle>
            <CardDescription>Basics brands see when browsing.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Niche</Label>
              <Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Fitness, travel…" className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label>Platforms (comma-separated)</Label>
              <Input value={platformsStr} onChange={(e) => setPlatformsStr(e.target.value)} placeholder="Instagram, YouTube" className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label>Audience size</Label>
              <Input type="number" value={audienceSize} onChange={(e) => setAudienceSize(e.target.value)} className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label>Rate per campaign (local currency)</Label>
              <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="rounded-xl" required />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="rounded-xl" placeholder="What you create and who you want to work with." />
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Social profiles</CardTitle>
              <CardDescription>Paste profile URLs. Add follower / following counts manually to sync your stats display.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addSocial}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {socials.map((row, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-neutral-100 bg-neutral-50/80 p-4 md:grid-cols-12 md:items-end">
                <div className="md:col-span-3 space-y-2">
                  <Label className="text-xs">Platform</Label>
                  <Select
                    value={row.platform}
                    onValueChange={(v) =>
                      setSocials((s) => s.map((r, j) => (j === i ? { ...r, platform: v as SocialRow["platform"] } : r)))
                    }
                  >
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-5 space-y-2">
                  <Label className="text-xs">Profile URL</Label>
                  <Input
                    value={row.profileUrl}
                    onChange={(e) => setSocials((s) => s.map((r, j) => (j === i ? { ...r, profileUrl: e.target.value } : r)))}
                    placeholder="https://instagram.com/…"
                    className="rounded-xl"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">Followers</Label>
                  <Input
                    type="number"
                    value={row.followers}
                    onChange={(e) => setSocials((s) => s.map((r, j) => (j === i ? { ...r, followers: e.target.value } : r)))}
                    className="rounded-xl"
                  />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Following</Label>
                    <Input
                      type="number"
                      value={row.following}
                      onChange={(e) => setSocials((s) => s.map((r, j) => (j === i ? { ...r, following: e.target.value } : r)))}
                      className="rounded-xl"
                    />
                  </div>
                  {socials.length > 1 ? (
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-xl" onClick={() => removeSocial(i)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Projects & media</CardTitle>
              <CardDescription>Cover image URL, title, story, and performance metrics (views, impressions, likes, shares).</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addProject}>
              <Plus className="mr-1 h-4 w-4" /> Add row
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects.map((row, i) => (
              <div key={i} className="space-y-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-800">Item {i + 1}</span>
                  {projects.length > 1 ? (
                    <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeProject(i)}>
                      Remove
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Image URL</Label>
                    <Input value={row.imageUrl} onChange={(e) => setProjects((p) => p.map((r, j) => (j === i ? { ...r, imageUrl: e.target.value } : r)))} placeholder="https://…" className="rounded-xl" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Title *</Label>
                    <Input value={row.title} onChange={(e) => setProjects((p) => p.map((r, j) => (j === i ? { ...r, title: e.target.value } : r)))} className="rounded-xl" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea value={row.description} onChange={(e) => setProjects((p) => p.map((r, j) => (j === i ? { ...r, description: e.target.value } : r)))} rows={3} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Views</Label>
                    <Input type="number" value={row.views} onChange={(e) => setProjects((p) => p.map((r, j) => (j === i ? { ...r, views: e.target.value } : r)))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Impressions</Label>
                    <Input type="number" value={row.impressions} onChange={(e) => setProjects((p) => p.map((r, j) => (j === i ? { ...r, impressions: e.target.value } : r)))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Likes</Label>
                    <Input type="number" value={row.likes} onChange={(e) => setProjects((p) => p.map((r, j) => (j === i ? { ...r, likes: e.target.value } : r)))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Shares</Label>
                    <Input type="number" value={row.shares} onChange={(e) => setProjects((p) => p.map((r, j) => (j === i ? { ...r, shares: e.target.value } : r)))} className="rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading} className="rounded-xl bg-yellow-400 font-semibold text-black hover:bg-yellow-500">
            {loading ? "Saving…" : "Complete setup"}
          </Button>
          {message ? <p className="text-sm text-red-600">{message}</p> : null}
        </div>
      </form>
    </div>
  );
}
