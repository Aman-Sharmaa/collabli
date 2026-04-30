"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  User,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Hash,
  Expand,
  Minus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Employee = {
  _id: string;
  name: string;
  email?: string;
  title?: string;
  department?: string;
  manager?: string;
  location?: string;
  employeeId?: number;
  phone?: string;
  avatarUrl?: string;
};

type TreeNode = {
  employee: Employee;
  children: TreeNode[];
};

function buildTree(employees: Employee[]): TreeNode[] {
  const byId = new Map<string, Employee>();
  const byName = new Map<string, Employee>();
  employees.forEach((e) => {
    byId.set(e._id, e);
    if (e.name?.trim()) byName.set(e.name.trim().toLowerCase(), e);
  });

  function makeNode(emp: Employee): TreeNode {
    const children = employees
      .filter((e) => {
        const mgr = e.manager?.trim();
        if (!mgr) return false;
        return mgr === emp._id || byName.get(mgr.toLowerCase())?._id === emp._id;
      })
      .map(makeNode)
      .sort((a, b) => (a.employee.name ?? "").localeCompare(b.employee.name ?? ""));
    return { employee: emp, children };
  }

  const roots = employees.filter((e) => {
    const mgr = e.manager?.trim();
    if (!mgr) return true;
    const byIdMatch = byId.has(mgr);
    const byNameMatch = byName.has(mgr.toLowerCase());
    return !byIdMatch && !byNameMatch;
  });
  return roots.map(makeNode).sort((a, b) => (a.employee.name ?? "").localeCompare(b.employee.name ?? ""));
}

type Props = {
  employees: {
    _id: string;
    name: string;
    email?: string;
    title?: string;
    department?: string;
    manager?: string;
    location?: string;
    employeeId?: number;
    phone?: string;
    avatarUrl?: string;
    isDismissed?: boolean;
  }[];
};

function TreeItem({
  node,
  level,
  expanded,
  selectedId,
  onToggle,
  onSelect,
}: {
  node: TreeNode;
  level: number;
  expanded: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (emp: Employee) => void;
}) {
  const e = node.employee;
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(e._id);
  const isSelected = selectedId === e._id;

  const initials = (e.name ?? "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex">
      {/* Vertical line for hierarchy */}
      {level > 0 && (
        <div className="flex shrink-0 flex-col items-center">
          <div className="w-px flex-1 min-h-[12px] bg-border" />
          <div className="w-4 h-px bg-border shrink-0" />
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <div
          className={cn(
            "group flex items-center gap-4 rounded-xl border-2 py-3 px-4 transition-all duration-200",
            "bg-card hover:bg-muted/40 hover:border-primary/30",
            "cursor-pointer select-none",
            isSelected
              ? "border-primary bg-primary/5 shadow-md"
              : "border-transparent hover:shadow-sm"
          )}
          style={level === 0 ? {} : { marginLeft: 0 }}
          onClick={() => onSelect(e)}
        >
          <button
            type="button"
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
              hasChildren
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "opacity-0 pointer-events-none"
            )}
            onClick={(ev) => {
              ev.stopPropagation();
              if (hasChildren) onToggle(e._id);
            }}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : null}
          </button>
          <Avatar className="h-11 w-11 shrink-0 border-2 border-background shadow-sm ring-1 ring-border/50">
            <AvatarImage src={e.avatarUrl} className="object-cover" />
            <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
              {initials || "—"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground truncate">{e.name || "—"}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate mt-0.5">
              {e.title && <span>{e.title}</span>}
              {e.department && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{e.department}</span>
                </>
              )}
            </div>
          </div>
          {hasChildren && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              <Users className="h-3 w-3" />
              {node.children.length}
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-2 ml-4 pl-6 border-l-2 border-border/60 space-y-2">
            {node.children.map((child) => (
              <TreeItem
                key={child.employee._id}
                node={child}
                level={level + 1}
                expanded={expanded}
                selectedId={selectedId}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PeopleTreeClient({ employees }: Props) {
  const router = useRouter();
  const visibleEmployees = useMemo(
    () => employees.filter((e) => !e.isDismissed),
    [employees]
  );
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(visibleEmployees.map((e) => e._id)));
  const [selected, setSelected] = useState<Employee | null>(null);

  const tree = useMemo(() => buildTree(visibleEmployees as Employee[]), [visibleEmployees]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setExpanded(new Set(visibleEmployees.map((e) => e._id)));
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  if (visibleEmployees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground rounded-2xl border-2 border-dashed">
        <User className="h-16 w-16 mb-4 opacity-40" />
        <p className="text-base font-medium">No team members yet</p>
        <p className="text-sm mt-1">Add employees to build your org chart</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-[10px]">
        <Button
          variant="outline"
          size="sm"
          onClick={expandAll}
          className="h-8 text-xs gap-1.5"
        >
          <Expand className="h-3.5 w-3.5" />
          Expand all
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={collapseAll}
          className="h-8 text-xs gap-1.5"
        >
          <Minus className="h-3.5 w-3.5" />
          Collapse all
        </Button>
        <span className="text-xs text-muted-foreground ml-1">
          {visibleEmployees.length} team members • Click to view details
        </span>
      </div>

      <div className="space-y-3">
        {tree.map((node) => (
          <TreeItem
            key={node.employee._id}
            node={node}
            level={0}
            expanded={expanded}
            selectedId={selected?._id ?? null}
            onToggle={toggle}
            onSelect={setSelected}
          />
        ))}
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="sr-only">Employee details</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 pt-4">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24 border-2 border-muted shadow-lg">
                    <AvatarImage src={selected.avatarUrl} />
                    <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                      {(selected.name ?? "")
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2) || "—"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-lg">{selected.name || "—"}</h3>
                    {(selected.title || selected.department) && (
                      <p className="text-sm text-muted-foreground">
                        {[selected.title, selected.department].filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 text-sm rounded-xl bg-muted/30 p-4">
                  {selected.employeeId != null && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">ID</p>
                        <p className="font-semibold">{selected.employeeId}</p>
                      </div>
                    </div>
                  )}
                  {selected.email && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Email</p>
                        <p className="font-medium break-all">{selected.email}</p>
                      </div>
                    </div>
                  )}
                  {selected.phone && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Phone</p>
                        <p className="font-medium">{selected.phone}</p>
                      </div>
                    </div>
                  )}
                  {selected.location && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Address</p>
                        <p className="font-medium">{selected.location}</p>
                      </div>
                    </div>
                  )}
                  {selected.department && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Department</p>
                        <p className="font-medium">{selected.department}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Full profile hidden for employees — contains sensitive data */}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
