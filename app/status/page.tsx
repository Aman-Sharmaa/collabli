import { StatusAllGroupsClient } from "@/components/status-all-groups-client";

export const metadata = {
  title: "Status · Kalp.ltd Monitor",
  description: "Service status for all monitored groups. Kalp.ltd Monitor.",
};

export default function StatusIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <StatusAllGroupsClient />
    </div>
  );
}
