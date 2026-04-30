"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [prefs, setPrefs] = useState({
    dealUpdates: true,
    messages: true,
    payments: true,
    deadlines: true,
    marketing: false,
  });
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailPw, setEmailPw] = useState("");
  const [delPw, setDelPw] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void fetch("/api/collabli/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setRole(d.user?.role || null);
        if (d.user?.role !== "creator" && d.user?.role !== "brand") {
          return;
        }
        void fetch("/api/collabli/users/settings")
          .then((r) => r.json())
          .then((s) => {
            setEmail(s.user?.email || "");
            setName(s.user?.name || "");
            if (s.user?.notificationPrefs) setPrefs({ ...prefs, ...s.user.notificationPrefs });
          });
      });
  }, []);

  async function savePrefs() {
    setMsg("");
    const res = await fetch("/api/collabli/users/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, notificationPrefs: prefs }),
    });
    const j = await res.json();
    if (!res.ok) return setMsg(j.message || "Save failed");
    setMsg("Saved.");
  }

  async function changePassword() {
    setMsg("");
    const res = await fetch("/api/collabli/users/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
    });
    const j = await res.json();
    if (!res.ok) return setMsg(j.message || "Failed");
    setCurPw("");
    setNewPw("");
    setMsg("Password updated.");
  }

  async function changeEmail() {
    setMsg("");
    const res = await fetch("/api/collabli/users/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail, password: emailPw }),
    });
    const j = await res.json();
    if (!res.ok) return setMsg(j.message || "Failed");
    setEmail(j.email);
    setNewEmail("");
    setEmailPw("");
    setMsg("Email updated. Sign in again on other devices.");
  }

  async function deleteAccount() {
    if (!confirm("Delete your account permanently? This cannot be undone.")) return;
    setMsg("");
    const res = await fetch("/api/collabli/users/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: delPw }),
    });
    const j = await res.json();
    if (!res.ok) return setMsg(j.message || "Failed");
    router.push("/login");
  }

  if (role !== "creator" && role !== "brand") {
    return <p className="text-sm text-neutral-600">Settings are available for creator and brand accounts.</p>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Account settings</h1>
        <p className="mt-1 text-sm text-neutral-600">Password, email, notifications, and account deletion.</p>
      </div>
      {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Profile name</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Display name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
          </div>
          <p className="text-xs text-neutral-500">Profile photo & bio: use Profile in the sidebar (creators).</p>
          <Button className="rounded-xl" variant="secondary" onClick={() => void savePrefs()}>
            Save name & notification prefs below
          </Button>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Notification preferences</CardTitle>
          <CardDescription>Control in-app notifications (email delivery can be added later).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              ["dealUpdates", "Deal accepted / rejected / status"],
              ["messages", "New messages on deals"],
              ["payments", "Payment received"],
              ["deadlines", "Deadline reminders"],
              ["marketing", "Product updates (off by default)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={prefs[key]}
                onCheckedChange={(c) => setPrefs((p) => ({ ...p, [key]: c === true }))}
              />
              {label}
            </label>
          ))}
          <Button className="rounded-xl bg-black text-white" onClick={() => void savePrefs()}>
            Save preferences
          </Button>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input type="password" placeholder="Current" value={curPw} onChange={(e) => setCurPw(e.target.value)} className="rounded-xl" />
          <Input type="password" placeholder="New (min 8 chars)" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="rounded-xl" />
          <Button className="rounded-xl" variant="secondary" onClick={() => void changePassword()}>
            Update password
          </Button>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Change email</CardTitle>
          <CardDescription>Current: {email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="New email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="rounded-xl" />
          <Input type="password" placeholder="Confirm with password" value={emailPw} onChange={(e) => setEmailPw(e.target.value)} className="rounded-xl" />
          <Button className="rounded-xl" variant="secondary" onClick={() => void changeEmail()}>
            Update email
          </Button>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base text-red-900">Social accounts</CardTitle>
          <CardDescription>Connect or disconnect Instagram, YouTube, etc. from the Profile page (paste URLs / follower counts).</CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-base text-red-900">Delete account</CardTitle>
          <CardDescription>Removes your public handle and signs you out.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input type="password" placeholder="Password to confirm" value={delPw} onChange={(e) => setDelPw(e.target.value)} className="rounded-xl" />
          <Button variant="destructive" className="rounded-xl" onClick={() => void deleteAccount()}>
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
