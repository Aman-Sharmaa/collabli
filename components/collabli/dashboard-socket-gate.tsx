"use client";

import { SocketProvider } from "@/components/socket-provider";

export function DashboardSocketGate({
  userId,
  enabled,
  children,
}: {
  userId: string;
  enabled: boolean;
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return <SocketProvider userId={userId}>{children}</SocketProvider>;
}
