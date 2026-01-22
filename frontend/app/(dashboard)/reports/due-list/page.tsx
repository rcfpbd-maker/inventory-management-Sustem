"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    FileText,
    Search,
    Download,
    Loader2,
    AlertCircle,
    Phone,
    User,
    ExternalLink,
    DollarSign
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFetchData } from "@/hooks/useFetchData";
import { reportApi } from "@/api/endpoint/report-api";
import Link from "next/link";

export default function DueListReportPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: reportData, isLoading } = useFetchData<any[]>({ url: reportApi.GET_DUE_LIST });
    const dueList = reportData || [];

    const filteredDueList = dueList.filter((item: any) =>
        item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer_phone?.includes(searchTerm)
    );

    const totalDue = filteredDueList.reduce((sum: number, item: any) => sum + Number(item.due_amount), 0);

    const handleExport = () => {
        const headers = ["Order ID", "Order Date", "Customer", "Phone", "Total Amount", "Paid Amount", "Due Amount"];
        const csvData = filteredDueList.map((item: any) => [
            item.order_id,
            format(new Date(item.date), "yyyy-MM-dd"),
            item.customer_name,
            item.customer_phone,
            item.total_amount,
            item.paid_amount,
            item.due_amount
        ]);

        const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `due_list_${format(new Date(), "yyyy-MM-dd")}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Due List Report
                    </h2>
                    <p className="text-muted-foreground">
                        Track outstanding payments and pending balances from customers.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport} disabled={filteredDueList.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Total Outstanding Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-700 dark:text-red-500">
                            ৳{totalDue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sum of all unpaid amounts from {filteredDueList.length} orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            Filter List
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="Search by customer name, phone or order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mt-1"
                        />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-red-500" />
                        <CardTitle>Customer Due Details</CardTitle>
                    </div>
                    <CardDescription>
                        List of orders with partial or no payments.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredDueList.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground">
                            No pending dues found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-zinc-50/50 dark:bg-zinc-800/50">
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-right">Paid</TableHead>
                                        <TableHead className="text-right">Due Amount</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDueList.map((item: any) => (
                                        <TableRow key={item.order_id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <TableCell className="font-medium">{item.order_id}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {format(new Date(item.date), "MMM dd, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm flex items-center gap-1">
                                                        <User className="h-3 w-3 text-muted-foreground" />
                                                        {item.customer_name || "Guest Customer"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {item.customer_phone || "—"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">৳{Number(item.total_amount).toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-green-600 dark:text-green-500 font-medium">
                                                ৳{Number(item.paid_amount || 0).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right text-red-600 dark:text-red-400 font-bold">
                                                ৳{Number(item.due_amount).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={Number(item.paid_amount) > 0 ? "secondary" : "destructive"} className="text-[10px] h-5 px-1.5 capitalize">
                                                    {Number(item.paid_amount) > 0 ? "Partial" : "Unpaid"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/orders/sales?id=${item.order_id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <ExternalLink className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
