"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type RateRow = { name: string; price: string; description: string };
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

export default function ProfileSettingsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [publicHandle, setPublicHandle] = useState("");
  const [bio, setBio] = useState("");
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [platformsStr, setPlatformsStr] = useState("");
  const [audienceSize, setAudienceSize] = useState("");
  const [rate, setRate] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [tagline, setTagline] = useState("");

  const [socials, setSocials] = useState<SocialRow[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [rateRows, setRateRows] = useState<RateRow[]>([{ name: "", price: "", description: "" }]);

  useEffect(() => {
    void (async () => {
      const me = await fetch("/api/collabli/auth/me").then((r) => r.json());
      setRole(me.user?.role || null);
      if (me.user?.role === "creator") {
        const d = await fetch("/api/collabli/creator-profile").then((r) => r.json());
        setPublicHandle(d.publicHandle || "");
        setAvatarUrl(d.avatarUrl || "");
        const p = d.profile;
        if (p) {
          setBio(p.bio || "");
          setNiche(p.niche || "");
          setLocation(p.location || "");
          setPlatformsStr((p.platforms || []).join(", "));
          setAudienceSize(String(p.audienceSize ?? ""));
          setRate(String(p.rate ?? ""));
          const rc = (p.rateCard || []) as { name?: string; price?: number; description?: string }[];
          setRateRows(
            rc.length
              ? rc.map((r) => ({
                  name: r.name || "",
                  price: String(r.price ?? ""),
                  description: r.description || "",
                }))
              : [{ name: "", price: "", description: "" }]
          );
          const sl = (p.socialLinks || []) as { platform: string; profileUrl: string; followers?: number; following?: number }[];
          setSocials(
            sl.length
              ? sl.map((s) => ({
                  platform: (PLATFORMS.includes(s.platform as (typeof PLATFORMS)[number]) ? s.platform : "other") as SocialRow["platform"],
                  profileUrl: s.profileUrl,
                  followers: String(s.followers ?? ""),
                  following: String(s.following ?? ""),
                }))
              : [{ platform: "instagram", profileUrl: "", followers: "", following: "" }]
          );
        } else {
          setSocials([{ platform: "instagram", profileUrl: "", followers: "", following: "" }]);
        }
      } else if (me.user?.role === "brand") {
        const d = await fetch("/api/collabli/brand-profile").then((r) => r.json());
        setPublicHandle(d.publicHandle || "");
        setAvatarUrl(d.avatarUrl || "");
        const p = d.profile;
        if (p) {
          setCompanyName(p.companyName || "");
          setIndustry(p.industry || "");
          setWebsite(p.website || "");
          setLocation(p.location || "");
          setMonthlyBudget(String(p.monthlyBudget ?? ""));
          setTagline(p.tagline || "");
          const sl = (p.socialLinks || []) as { platform: string; profileUrl: string; followers?: number; following?: number }[];
          setSocials(
            sl.length
              ? sl.map((s) => ({
                  platform: (PLATFORMS.includes(s.platform as (typeof PLATFORMS)[number]) ? s.platform : "other") as SocialRow["platform"],
                  profileUrl: s.profileUrl,
                  followers: String(s.followers ?? ""),
                  following: String(s.following ?? ""),
                }))
              : [{ platform: "instagram", profileUrl: "", followers: "", following: "" }]
          );
        } else {
          setSocials([{ platform: "instagram", profileUrl: "", followers: "", following: "" }]);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (role !== "creator" && role !== "brand") return;
    setSaving(true);
    setMessage("");
    const socialLinks = socials
      .map((r) => ({
        platform: r.platform,
        profileUrl: r.profileUrl.trim(),
        followers: Number(r.followers || 0),
        following: Number(r.following || 0),
      }))
      .filter((r) => r.profileUrl.length > 0);

    const rateCard =
      role === "creator"
        ? rateRows
            .map((r) => ({
              name: r.name.trim(),
              price: Number(r.price || 0),
              description: r.description.trim(),
            }))
            .filter((r) => r.name.length > 0)
        : undefined;

    const url = role === "creator" ? "/api/collabli/creator-profile" : "/api/collabli/brand-profile";
    const body =
      role === "creator"
        ? {
            publicHandle,
            bio,
            niche,
            location,
            platforms: platformsStr.split(",").map((v) => v.trim()).filter(Boolean),
            audienceSize: Number(audienceSize || 0),
            rate: Number(rate || 0),
            socialLinks,
            rateCard,
          }
        : {
            publicHandle,
            companyName,
            industry,
            website,
            location,
            monthlyBudget: Number(monthlyBudget || 0),
            tagline,
            socialLinks,
          };

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMessage(data.message || "Save failed");
    if ((role === "creator" || role === "brand") && avatarUrl !== undefined) {
      await fetch("/api/collabli/users/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });
    }
    setMessage("Saved.");
  }

  if (loading) return <div className="text-sm text-neutral-500">Loading profile…</div>;
  if (role !== "creator" && role !== "brand") {
    return <p className="text-sm text-neutral-600">Profile settings are for creators and brands.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Profile & social</h1>
        <p className="mt-1 text-sm text-neutral-600">Update your public username and connected channels.</p>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {role === "creator" || role === "brand" ? (
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle>Profile photo</CardTitle>
              <CardDescription>Image URL for your avatar (use a CDN or direct link).</CardDescription>
            </CardHeader>
            <CardContent>
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="rounded-xl" placeholder="https://…" />
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Public username</CardTitle>
            <CardDescription>Shown as @handle on your public page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex max-w-md items-center gap-2">
              <span className="text-sm text-neutral-500">@</span>
              <Input value={publicHandle} onChange={(e) => setPublicHandle(e.target.value.replace(/^@+/, ""))} className="rounded-xl" />
            </div>
          </CardContent>
        </Card>

        {role === "creator" ? (
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle>Creator details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Niche</Label>
                <Input value={niche} onChange={(e) => setNiche(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Platforms (comma-separated)</Label>
                <Input value={platformsStr} onChange={(e) => setPlatformsStr(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Audience size</Label>
                <Input type="number" value={audienceSize} onChange={(e) => setAudienceSize(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Rate / campaign</Label>
                <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {role === "creator" ? (
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Rate card</CardTitle>
                <CardDescription>Packages brands can book (e.g. 1 Reel, Story set).</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setRateRows((r) => [...r, { name: "", price: "", description: "" }])}
              >
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {rateRows.map((row, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-neutral-100 bg-neutral-50/80 p-4 md:grid-cols-12">
                  <div className="md:col-span-4 space-y-2">
                    <Label className="text-xs">Offer name</Label>
                    <Input
                      value={row.name}
                      onChange={(e) => setRateRows((rows) => rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <Label className="text-xs">Price</Label>
                    <Input
                      type="number"
                      value={row.price}
                      onChange={(e) => setRateRows((rows) => rows.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="md:col-span-4 space-y-2">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={row.description}
                      onChange={(e) => setRateRows((rows) => rows.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end justify-end">
                    {rateRows.length > 1 ? (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setRateRows((rows) => rows.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {role === "brand" ? (
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle>Brand details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input value={industry} onChange={(e) => setIndustry(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Monthly budget</Label>
                <Input type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} className="rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Tagline</Label>
                <Textarea value={tagline} onChange={(e) => setTagline(e.target.value)} rows={2} className="rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Social links</CardTitle>
              <CardDescription>Paste profile URLs; set follower counts to keep stats in sync.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setSocials((s) => [...s, { platform: "instagram", profileUrl: "", followers: "", following: "" }])}
            >
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
                  <Label className="text-xs">URL</Label>
                  <Input
                    value={row.profileUrl}
                    onChange={(e) => setSocials((s) => s.map((r, j) => (j === i ? { ...r, profileUrl: e.target.value } : r)))}
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
                    <Button type="button" variant="ghost" size="icon" className="rounded-xl" onClick={() => setSocials((s) => s.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving} className="rounded-xl bg-yellow-400 font-semibold text-black hover:bg-yellow-500">
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        </div>
      </form>
    </div>
  );
}
