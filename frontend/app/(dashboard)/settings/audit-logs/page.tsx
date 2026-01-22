"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    FileText,
    Search,
    Filter,
    Download,
    Loader2,
    Calendar as CalendarIcon,
    User as UserIcon,
    Tag,
    Activity,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuditLogs, AuditFilters } from "@/hooks/use-audit";
import { useFetchData } from "@/hooks/useFetchData";
import { userApi } from "@/api/endpoint/user-api";

const CATEGORIES = [
    "AUTH",
    "PRODUCT",
    "ORDER",
    "CUSTOMER",
    "SUPPLIER",
    "CATEGORY",
    "COURIER",
    "FINANCE",
    "PAYMENT",
    "RETURN",
    "SETTINGS",
    "USER",
    "SYSTEM",
];

const ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "OTHER"];

const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        AUTH: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        PRODUCT: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        ORDER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        CUSTOMER: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
        SUPPLIER: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        FINANCE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        PAYMENT: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
        RETURN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        SETTINGS: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
        USER: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        SYSTEM: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
};

const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
        CREATE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        LOGIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        LOGOUT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return colors[action] || "bg-gray-100 text-gray-700";
};

export default function AuditLogsPage() {
    const [filters, setFilters] = useState<AuditFilters>({
        page: 1,
        limit: 50,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

    const { data: auditData, isLoading } = useAuditLogs(filters);
    const { data: usersData } = useFetchData<any[]>({ url: userApi.GET_ALL });

    const users = usersData || [];

    // Handle both 'data' and 'Data' from backend response
    const responseData = auditData?.data || auditData?.Data;
    const auditLogs = responseData?.data || responseData?.Data || [];
    const pagination = responseData?.pagination;

    const handleFilterChange = (key: keyof AuditFilters, value: any) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value === "all" ? undefined : value,
            page: 1, // Reset to first page when filters change
        }));
    };

    const handleDateRangeApply = () => {
        setFilters((prev) => ({
            ...prev,
            startDate: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
            endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
            page: 1,
        }));
    };

    const handleClearFilters = () => {
        setFilters({ page: 1, limit: 50 });
        setSearchTerm("");
        setDateRange({});
    };

    const filteredLogs = auditLogs.filter((log: any) =>
        log.event.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Audit Logs
                    </h2>
                    <p className="text-muted-foreground">
                        Real-time activity tracking across all system modules.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleClearFilters}>
                        <Filter className="mr-2 h-4 w-4" />
                        Clear Filters
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (filteredLogs.length === 0) return;
                            const headers = ["Timestamp", "User", "Category", "Action", "Event"];
                            const csvData = filteredLogs.map((log: any) => [
                                format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
                                log.username || "System",
                                log.category,
                                log.action,
                                `"${log.event.replace(/"/g, '""')}"`
                            ]);
                            const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
                            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(blob);
                            link.download = `audit_logs_${format(new Date(), "yyyy-MM-dd")}.csv`;
                            link.click();
                        }}
                        disabled={filteredLogs.length === 0}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* User Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                User
                            </label>
                            <Select
                                value={filters.userId || "all"}
                                onValueChange={(value) => handleFilterChange("userId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    {users.map((user: any) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.username}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Category
                            </label>
                            <Select
                                value={filters.category || "all"}
                                onValueChange={(value) => handleFilterChange("category", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Action
                            </label>
                            <Select
                                value={filters.action || "all"}
                                onValueChange={(value) => handleFilterChange("action", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    {ACTIONS.map((action) => (
                                        <SelectItem key={action} value={action}>
                                            {action}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                Date Range
                            </label>
                            <div className="flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick a date range</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={dateRange.from}
                                            selected={{ from: dateRange.from, to: dateRange.to }}
                                            onSelect={(range: any) => setDateRange(range || {})}
                                            numberOfMonths={2}
                                        />
                                        <div className="p-3 border-t">
                                            <Button onClick={handleDateRangeApply} className="w-full" size="sm">
                                                Apply
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search events..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <CardTitle>Activity Timeline</CardTitle>
                    </div>
                    <CardDescription>
                        {pagination ? `Showing ${filteredLogs.length} of ${pagination.total} total records` : "Loading..."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground">
                            No audit logs found for the selected filters.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-zinc-50/50 dark:bg-zinc-800/50">
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Event</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log: any) => (
                                        <TableRow key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground">
                                                {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{log.username || "System"}</span>
                                                    <span className="text-xs text-muted-foreground">{log.user_email || "—"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn("text-xs", getCategoryColor(log.category))}>
                                                    {log.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn("text-xs", getActionColor(log.action))}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-md truncate">{log.event}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === 1}
                            onClick={() => handleFilterChange("page", pagination.page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => handleFilterChange("page", pagination.page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
