"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Loader2, FileText, Search, Filter, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ProposalsPage() {
    const [proposals, setProposals] = useState<any[]>([]);
    const [filteredProposals, setFilteredProposals] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [clientFilter, setClientFilter] = useState("all");

    useEffect(() => {
        Promise.all([
            fetch("/api/proposals").then((r) => r.json()),
            fetch("/api/clients").then((r) => r.json())
        ])
            .then(([proposalsData, clientsData]) => {
                setProposals(proposalsData.proposals || []);
                setFilteredProposals(proposalsData.proposals || []);
                setClients(clientsData.clients || []);
            })
            .catch((e) => console.error(e))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let res = proposals;

        if (search) {
            res = res.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
        }

        if (statusFilter !== "all") {
            res = res.filter(p => p.status === statusFilter);
        }

        if (clientFilter !== "all") {
            res = res.filter(p => {
                const clientId = p.client?._id || p.client;
                return clientId === clientFilter;
            });
        }

        setFilteredProposals(res);
    }, [search, statusFilter, clientFilter, proposals]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
                    <p className="text-muted-foreground">Manage and track your project proposals.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/finance/proposals/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            Proposal Settings
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/finance/proposals/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Proposal
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search proposals..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Client" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {clients.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.companyName || c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Title</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="text-right">Created</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProposals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No proposals found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProposals.map((proposal) => (
                                <TableRow key={proposal.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="font-medium flex items-center gap-2">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            {proposal.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>{proposal.client?.companyName || proposal.client?.name || "Unknown"}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                        ${proposal.status === "accepted" ? "bg-green-100 text-green-800" :
                                                proposal.status === "sent" ? "bg-blue-100 text-blue-800" :
                                                    proposal.status === "rejected" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
                                        >
                                            {proposal.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {proposal.currency} {proposal.totalAmount.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {new Date(proposal.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/finance/proposals/${proposal.id}`}>
                                                View
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
