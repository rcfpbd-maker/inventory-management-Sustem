"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
    BarChart3,
    Calendar as CalendarIcon,
    Download,
    Filter,
    Loader2,
    TrendingUp,
    Globe,
    ShoppingCart,
    Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFetchData } from "@/hooks/useFetchData";
import { reportApi } from "@/api/endpoint/report-api";

export default function PlatformSalesReportPage() {
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    const { data: reportData, isLoading } = useFetchData({
        url: reportApi.GET_PLATFORM_SALES,
        params: {
            startDate: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
            endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        },
        isEnabled: !!(dateRange.from && dateRange.to)
    });
    const salesByPlatform = (reportData as any[]) || [];

    const totalSales = salesByPlatform.reduce((sum: number, item: any) => sum + Number(item.total_amount), 0);
    const totalOrders = salesByPlatform.reduce((sum: number, item: any) => sum + Number(item.order_count), 0);

    const handleExport = () => {
        // CSV Export logic
        const headers = ["Platform", "Order Count", "Total Sales", "Avg Order Value"];
        const csvData = salesByPlatform.map((item: any) => [
            item.platform,
            item.order_count,
            item.total_amount,
            (Number(item.total_amount) / Number(item.order_count)).toFixed(2)
        ]);

        const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `platform_sales_${format(new Date(), "yyyy-MM-dd")}.csv`);
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
                        Platform Sales Report
                    </h2>
                    <p className="text-muted-foreground">
                        Analyze sales performance across different selling platforms.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal w-[240px]">
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
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" onClick={handleExport} disabled={salesByPlatform.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Platform Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{totalSales.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            Accumulated sales amount
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-purple-50/50 dark:bg-purple-950/10 border-purple-100 dark:border-purple-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3 text-purple-500" />
                            Orders across platforms
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-orange-50/50 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg. Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ৳{totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Users className="h-3 w-3 text-orange-500" />
                            Revenue per average order
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        <CardTitle>Sales Breakdown by Platform</CardTitle>
                    </div>
                    <CardDescription>
                        Performance comparison of different sales channels.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : salesByPlatform.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground">
                            No sales data found for the selected period.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-zinc-50/50 dark:bg-zinc-800/50">
                                    <TableHead>Platform</TableHead>
                                    <TableHead className="text-right">Order Count</TableHead>
                                    <TableHead className="text-right">Total Revenue</TableHead>
                                    <TableHead className="text-right">Avg. Order Value</TableHead>
                                    <TableHead className="text-right">Market Share</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesByPlatform.map((item: any) => (
                                    <TableRow key={item.platform} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-medium">
                                                <Globe className="h-4 w-4 text-muted-foreground" />
                                                {item.platform}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">{item.order_count}</TableCell>
                                        <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                                            ৳{Number(item.total_amount).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ৳{(Number(item.total_amount) / Number(item.order_count)).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {((Number(item.total_amount) / totalSales) * 100).toFixed(1)}%
                                                </span>
                                                <div className="w-20 bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-blue-500 h-full"
                                                        style={{ width: `${(Number(item.total_amount) / totalSales) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
