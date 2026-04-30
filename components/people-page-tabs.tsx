"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeopleTableClient } from "@/components/people-table-client";
import { PeopleTreeClient } from "@/components/people-tree-client";
import { TeamMemberOnboardingSection } from "@/components/team-member-onboarding-section";
import { Users, Link2, List as ListIcon, Network } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmployeeRow = {
  _id: string;
  name: string;
  email: string;
  title?: string;
  department?: string;
  manager?: string;
  location?: string;
  type?: string;
  employeeId?: number;
  phone?: string;
  dateOfHiring?: string | null;
  isDismissed?: boolean;
  avatarUrl?: string;
  assignedProduct?: string;
  assignedService?: string;
};

type Props = {
  employees: EmployeeRow[];
  isAdmin: boolean;
};

export function PeoplePageTabs({ employees, isAdmin }: Props) {
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");

  return (
    <Tabs defaultValue="team" className="w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <TabsList className="rounded-xl h-11 px-1">
          <TabsTrigger value="team" className="rounded-lg px-4 gap-2">
            <Users className="h-4 w-4" />
            Team members
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="onboarding" className="rounded-lg px-4 gap-2">
              <Link2 className="h-4 w-4" />
              Onboarding
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="team" className="m-0 mt-0">
          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-muted-foreground/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "h-8 px-3 rounded-lg gap-2 text-xs font-medium transition-all",
                viewMode === "list"
                  ? "bg-white dark:bg-zinc-900 shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              )}
            >
              <ListIcon className="h-3.5 w-3.5" />
              List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("tree")}
              className={cn(
                "h-8 px-3 rounded-lg gap-2 text-xs font-medium transition-all",
                viewMode === "tree"
                  ? "bg-white dark:bg-zinc-900 shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              )}
            >
              <Network className="h-3.5 w-3.5" />
              Tree
            </Button>
          </div>
        </TabsContent>
      </div>

      <TabsContent value="team" className="mt-[10px]">
        {viewMode === "list" ? (
          <PeopleTableClient employees={employees} isAdmin={isAdmin} />
        ) : (
          <PeopleTreeClient employees={employees} />
        )}
      </TabsContent>
      {isAdmin && (
        <TabsContent value="onboarding" className="mt-[10px]">
          <TeamMemberOnboardingSection />
        </TabsContent>
      )}
    </Tabs>
  );
}
