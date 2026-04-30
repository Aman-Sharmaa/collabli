"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Copy,
  Eye,
  EyeOff,
  Filter,
  Server,
  Cloud,
  Key,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Credential {
  key: string;
  value: string;
  isSecret?: boolean;
  isMultiline?: boolean;
}

interface CredNode {
  id: string;
  type: "Service" | "Deployment" | "Server";
  name: string;
  projectName: string;
  clientName: string;
  credentials: Credential[];
  updatedAt: string;
}

export default function CredsHub() {
  const [creds, setCreds] = useState<CredNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedCred, setSelectedCred] = useState<CredNode | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const fetchCreds = () => {
    setLoading(true);
    fetch("/api/devops/creds")
      .then((res) => res.json())
      .then((data) => {
        if (data.creds) setCreds(data.creds);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCreds();
  }, []);

  const toggleSecret = (id: string, key: string) => {
    const compositeKey = `${id}-${key}`;
    setShowSecrets((prev) => ({ ...prev, [compositeKey]: !prev[compositeKey] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const filteredCreds = creds.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "all" || c.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesProject =
      projectFilter === "all" || c.projectName === projectFilter;
    return matchesSearch && matchesType && matchesProject;
  });

  const projects = Array.from(new Set(creds.map((c) => c.projectName))).sort();

  const typeIcon = (type: string) => {
    if (type === "Service") return <Key className="h-3.5 w-3.5 text-blue-600" />;
    if (type === "Deployment") return <Cloud className="h-3.5 w-3.5 text-purple-600" />;
    return <Server className="h-3.5 w-3.5 text-emerald-600" />;
  };

  const typeBadgeClass = (type: string) => {
    if (type === "Service") return "bg-blue-50 text-blue-700 border-blue-200";
    if (type === "Deployment") return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent">
            Credentials Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Centralized access for all services, deployments, and servers.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCreds} disabled={loading} className="h-9">
          <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-xl border">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services, projects, or clients..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-background">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="service">Third-party Services</SelectItem>
            <SelectItem value="deployment">Deployments (Env)</SelectItem>
            <SelectItem value="server">Infrastructure (SSH)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="bg-background">
            <Cloud className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted/20 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredCreds.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-muted">
          <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground">No credentials found</h3>
          <p className="text-muted-foreground/60 max-w-sm mx-auto mt-2">
            Try adjusting your filters or search query.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => { setSearchQuery(""); setTypeFilter("all"); setProjectFilter("all"); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-[10px] uppercase font-bold tracking-wider w-[100px]">Type</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider">Name</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider">Project / Domain</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider">Client</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider w-[80px] text-center">Keys</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider w-[120px]">Updated</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider w-[80px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreds.map((node) => (
                <TableRow key={node.id} className="cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setSelectedCred(node)}>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[9px] uppercase font-bold tracking-wider px-1.5 h-5 gap-1", typeBadgeClass(node.type))}>
                      {typeIcon(node.type)}
                      {node.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-sm">{node.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{node.projectName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-zinc-100 font-bold h-5 text-[9px]">{node.clientName}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {node.credentials.length}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(node.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary hover:text-primary" onClick={(e) => { e.stopPropagation(); setSelectedCred(node); }}>
                      <Eye className="h-3 w-3" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedCred} onOpenChange={(open) => { if (!open) setSelectedCred(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedCred && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn("text-[9px] uppercase font-bold tracking-wider px-1.5 h-5 gap-1", typeBadgeClass(selectedCred.type))}>
                    {typeIcon(selectedCred.type)}
                    {selectedCred.type}
                  </Badge>
                  <Badge variant="secondary" className="bg-zinc-100 font-bold h-5 text-[9px]">{selectedCred.clientName}</Badge>
                </div>
                <DialogTitle className="text-xl">{selectedCred.name}</DialogTitle>
                <DialogDescription>
                  {selectedCred.projectName} • Updated {new Date(selectedCred.updatedAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {selectedCred.credentials.map((cred, idx) => {
                  const isShown = showSecrets[`${selectedCred.id}-${cred.key}`];
                  return (
                    <div key={idx} className="space-y-1.5 p-3 rounded-lg border bg-muted/10 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">{cred.key}</span>
                        <div className="flex items-center gap-1">
                          {cred.isSecret && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleSecret(selectedCred.id, cred.key)}>
                              {isShown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(cred.value)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {cred.isMultiline ? (
                        <pre className={cn(
                          "text-xs font-mono p-3 bg-zinc-50 rounded-md border overflow-x-auto max-h-40 scrollbar-thin",
                          !isShown && cred.isSecret && "blur-sm select-none"
                        )}>
                          {cred.value}
                        </pre>
                      ) : (
                        <div className={cn(
                          "text-sm font-mono truncate bg-zinc-50 border px-3 py-2 rounded-md",
                          !isShown && cred.isSecret && "blur-sm select-none"
                        )}>
                          {isShown || !cred.isSecret ? cred.value : "••••••••••••••••"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
