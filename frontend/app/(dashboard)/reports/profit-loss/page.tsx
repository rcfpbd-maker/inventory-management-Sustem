"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";
import { reportApi } from "@/api/endpoint/report-api";
import { useFetchData } from "@/hooks/useFetchData";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ProfitLossData {
    startDate: string;
    endDate: string;
    totalRevenue: number;
    expenses: {
        productCost: number;
        packagingCost: number;
        courierCost: number;
        adCost: number;
        otherExpense: number;
        total: number;
    };
    netProfit: number;
    status: "Profit" | "Loss";
}

interface OrderProfitData {
    orderId: string;
    date: string;
    revenue: number;
    expense: number | null;
    profit: number;
}

export default function ProfitLossPage() {
    const [date, setDate] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    const { data, isLoading, isError } = useFetchData<ProfitLossData>({
        url: reportApi.PROFIT_LOSS(
            date.from ? format(date.from, "yyyy-MM-dd") : "",
            date.to ? format(date.to, "yyyy-MM-dd") : ""
        ),
        isEnabled: !!date.from && !!date.to,
    });

    const { data: orderData, isLoading: isOrderLoading } = useFetchData<OrderProfitData[]>({
        url: reportApi.ORDER_PROFIT,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-BD", {
            style: "currency",
            currency: "BDT",
        }).format(amount);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Profit & Loss Analysis</h2>
                <div className="flex items-center space-x-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[260px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
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
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={(range: any) => setDate(range)}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" disabled>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="orders">Order Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-96">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : isError || !data ? (
                        <div className="flex items-center justify-center h-96 text-destructive">
                            Failed to load report data.
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">{formatCurrency(data.totalRevenue)}</div>
                                        <p className="text-xs text-muted-foreground">Sales Income</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-600">{formatCurrency(data.expenses.total)}</div>
                                        <p className="text-xs text-muted-foreground">All operational costs</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={cn("text-2xl font-bold", data.netProfit >= 0 ? "text-green-600" : "text-red-600")}>
                                            {formatCurrency(data.netProfit)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {data.status} for selected period
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Margin</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {data.totalRevenue > 0
                                                ? ((data.netProfit / data.totalRevenue) * 100).toFixed(1)
                                                : 0}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">Profit Margin</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-4">
                                    <CardHeader>
                                        <CardTitle>Expense Breakdown</CardTitle>
                                        <CardDescription>
                                            Detailed view of where money is being spent.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <ExpenseItem label="Product Cost" amount={data.expenses.productCost} total={data.expenses.total} />
                                            <ExpenseItem label="Packaging Details" amount={data.expenses.packagingCost} total={data.expenses.total} />
                                            <ExpenseItem label="Courier / Delivery" amount={data.expenses.courierCost} total={data.expenses.total} />
                                            <ExpenseItem label="Marketing / Ads" amount={data.expenses.adCost} total={data.expenses.total} />
                                            <ExpenseItem label="Other / Overhead" amount={data.expenses.otherExpense} total={data.expenses.total} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="col-span-3">
                                    <CardHeader>
                                        <CardTitle>Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm space-y-2">
                                            <p>
                                                <strong>Profitability:</strong> You are currently running at a <span className={data.netProfit >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{data.status}</span>.
                                            </p>
                                            <p>
                                                <strong>Major Cost Driver:</strong> {' '}
                                                {getLargestExpense(data.expenses)}
                                            </p>
                                            <p className="text-muted-foreground mt-4 text-xs">
                                                Note: This report excludes cancelled orders and generic returns.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Profitability</CardTitle>
                            <CardDescription>
                                Profit margin analysis per individual order.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isOrderLoading ? (
                                <div className="flex items-center justify-center h-48">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead className="text-right">Revenue</TableHead>
                                            <TableHead className="text-right">Expense</TableHead>
                                            <TableHead className="text-right">Profit</TableHead>
                                            <TableHead className="text-right">Margin</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orderData?.map((order) => {
                                            const margin = order.revenue > 0 ? (order.profit / order.revenue) * 100 : 0;
                                            return (
                                                <TableRow key={order.orderId}>
                                                    <TableCell>{format(new Date(order.date), "dd MMM yyyy")}</TableCell>
                                                    <TableCell className="font-medium">{order.orderId.slice(0, 8)}...</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(Number(order.revenue))}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(Number(order.expense || 0))}</TableCell>
                                                    <TableCell className={cn("text-right font-bold", order.profit >= 0 ? "text-green-600" : "text-red-600")}>
                                                        {formatCurrency(order.profit)}
                                                    </TableCell>
                                                    <TableCell className="text-right">{margin.toFixed(1)}%</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {(!orderData || orderData.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                    No order data available.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

const ExpenseItem = ({ label, amount, total }: { label: string, amount: number, total: number }) => {
    const percentage = total > 0 ? (amount / total) * 100 : 0;
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <span>{label}</span>
                <span className="font-medium">
                    {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(amount)}
                </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}% of total</p>
        </div>
    )
}

const getLargestExpense = (expenses: ProfitLossData['expenses']) => {
    const entries = Object.entries(expenses).filter(([key]) => key !== 'total');
    let maxKey = "";
    let maxValue = -1;

    entries.forEach(([key, value]) => {
        if (value > maxValue) {
            maxValue = value;
            maxKey = key;
        }
    });

    const labels: Record<string, string> = {
        productCost: "Product Sourcing",
        packagingCost: "Packaging",
        courierCost: "Courier & Delivery",
        adCost: "Marketing & Ads",
        otherExpense: "Overhead / Other"
    };

    return labels[maxKey] || maxKey;
}
