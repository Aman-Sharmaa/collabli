"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const TerminalClient = dynamic(() => import("@/components/terminal-client"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#0d1117]">
      <div className="flex items-center gap-3 text-neutral-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading terminal...</span>
      </div>
    </div>
  ),
});

export default function TerminalPage() {
  const searchParams = useSearchParams();
  const serverId = searchParams?.get("server") || "";
  const serverName = searchParams?.get("name") || "Server";
  const serverIp = searchParams?.get("ip") || "";

  if (!serverId) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1117] text-neutral-400">
        <p>No server specified.</p>
      </div>
    );
  }

  return (
    <TerminalClient
      serverId={serverId}
      serverName={serverName}
      serverIp={serverIp}
    />
  );
}
