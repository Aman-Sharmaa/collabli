"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/components/socket-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Peer = {
  peerId: string;
  unread: number;
  peer: { name?: string; email?: string; publicHandle?: string; role?: string };
  lastMessage: { body?: string; createdAt?: string; fromUserId?: string; toUserId?: string };
};

type DM = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  createdAt?: string;
};

export default function MessagesPage() {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Peer[]>([]);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [thread, setThread] = useState<DM[]>([]);
  const [draft, setDraft] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMe = useCallback(async () => {
    const res = await fetch("/api/collabli/auth/me");
    const data = await res.json();
    if (res.ok && data.user?.id) setMe(String(data.user.id));
  }, []);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/collabli/direct-messages");
    const data = await res.json();
    if (!res.ok) return;
    setConversations(data.conversations || []);
  }, []);

  const loadThread = useCallback(async (withId: string) => {
    const res = await fetch(`/api/collabli/direct-messages?with=${encodeURIComponent(withId)}`);
    const data = await res.json();
    if (!res.ok) return;
    const raw = data.messages || [];
    setThread(
      raw.map((m: Record<string, unknown>) => ({
        _id: String(m._id),
        fromUserId: String(m.fromUserId),
        toUserId: String(m.toUserId),
        body: String(m.body || ""),
        createdAt: m.createdAt ? new Date(m.createdAt as string).toISOString() : undefined,
      }))
    );
  }, []);

  useEffect(() => {
    void loadMe();
    void loadConversations();
  }, [loadMe, loadConversations]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("to");
    if (!q) return;
    setPeerId(q);
    setConversations((prev) => {
      if (prev.some((c) => c.peerId === q)) return prev;
      return [
        {
          peerId: q,
          unread: 0,
          peer: { name: "User", email: "", publicHandle: "" },
          lastMessage: {},
        },
        ...prev,
      ];
    });
  }, []);

  useEffect(() => {
    if (peerId) void loadThread(peerId);
  }, [peerId, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread, peerId]);

  useEffect(() => {
    if (!socket || !me) return;
    const onDm = (payload: { id: string; fromUserId: string; toUserId: string; body: string; createdAt?: string }) => {
      const other = payload.fromUserId === me ? payload.toUserId : payload.fromUserId;
      setConversations((prev) => {
        const next = [...prev];
        const i = next.findIndex((c) => c.peerId === other);
        const stubLast = {
          body: payload.body,
          createdAt: payload.createdAt,
          fromUserId: payload.fromUserId,
          toUserId: payload.toUserId,
        };
        if (i === -1) {
          next.unshift({
            peerId: other,
            unread: payload.toUserId === me ? 1 : 0,
            peer: { name: "User", email: "", publicHandle: "" },
            lastMessage: stubLast,
          });
          return next;
        }
        const row = { ...next[i], lastMessage: stubLast };
        if (payload.toUserId === me && peerId !== other) {
          row.unread = (row.unread || 0) + 1;
        }
        next.splice(i, 1);
        next.unshift(row);
        return next;
      });
      if (peerId && (payload.fromUserId === peerId || payload.toUserId === peerId)) {
        setThread((t) => [
          ...t,
          {
            _id: payload.id,
            fromUserId: payload.fromUserId,
            toUserId: payload.toUserId,
            body: payload.body,
            createdAt: payload.createdAt,
          },
        ]);
      }
    };
    socket.on("collabli-dm", onDm);
    return () => {
      socket.off("collabli-dm", onDm);
    };
  }, [socket, me, peerId]);

  async function send() {
    if (!peerId || !draft.trim()) return;
    setErr("");
    const res = await fetch("/api/collabli/direct-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: peerId, body: draft.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.message || "Failed to send");
      return;
    }
    setDraft("");
    const created = data.message as Record<string, unknown>;
    if (created?._id && me) {
      setThread((t) => [
        ...t,
        {
          _id: String(created._id),
          fromUserId: me,
          toUserId: peerId,
          body: String(created.body || ""),
          createdAt: created.createdAt ? new Date(created.createdAt as string).toISOString() : undefined,
        },
      ]);
    }
    void loadConversations();
  }

  function openPeer(id: string) {
    setPeerId(id);
    setConversations((prev) =>
      prev.map((c) => (c.peerId === id ? { ...c, unread: 0 } : c))
    );
  }

  const activePeer = conversations.find((c) => c.peerId === peerId);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 lg:h-[calc(100vh-8rem)] lg:flex-row lg:gap-6">
      <Card className="flex max-h-[40vh] flex-col border-neutral-200 lg:max-h-none lg:w-[320px] lg:shrink-0">
        <CardHeader className="border-b border-neutral-100 py-4">
          <CardTitle className="text-lg">Conversations</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">No messages yet. Start from a profile or campaign.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {conversations.map((c) => (
                <li key={c.peerId}>
                  <button
                    type="button"
                    onClick={() => openPeer(c.peerId)}
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left text-sm transition-colors hover:bg-neutral-50",
                      peerId === c.peerId && "bg-yellow-400/10"
                    )}
                  >
                    <span className="font-medium text-neutral-900">
                      {c.peer?.name || c.peer?.email || "User"}
                      {c.peer?.publicHandle ? (
                        <span className="ml-1 text-neutral-500">@{c.peer.publicHandle}</span>
                      ) : null}
                    </span>
                    <span className="line-clamp-1 text-xs text-neutral-500">{c.lastMessage?.body}</span>
                    {c.unread > 0 ? (
                      <span className="mt-1 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-semibold text-black">
                        {c.unread} new
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="flex min-h-[320px] flex-1 flex-col border-neutral-200">
        <CardHeader className="border-b border-neutral-100 py-4">
          <CardTitle className="text-lg">
            {peerId
              ? activePeer?.peer?.name || activePeer?.peer?.email || "Chat"
              : "Select a conversation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <div className="flex-1 space-y-2 overflow-y-auto rounded-xl bg-neutral-50/80 p-3">
            {!peerId ? (
              <p className="text-sm text-neutral-500">Choose someone from the list or message them from the directory.</p>
            ) : thread.length === 0 ? (
              <p className="text-sm text-neutral-500">Say hello to start the thread.</p>
            ) : (
              thread.map((m) => {
                const mine = me && m.fromUserId === me;
                return (
                  <div
                    key={m._id}
                    className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm", mine ? "ml-auto bg-yellow-400/90 text-black" : "bg-white text-neutral-900 shadow-sm")}
                  >
                    {m.body}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={peerId ? "Message…" : "Select a conversation first"}
              disabled={!peerId}
              className="rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), void send())}
            />
            <Button type="button" className="rounded-xl bg-yellow-400 text-black hover:bg-yellow-500" disabled={!peerId} onClick={() => void send()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
