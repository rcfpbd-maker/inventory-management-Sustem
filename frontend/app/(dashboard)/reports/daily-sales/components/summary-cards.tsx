"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../../../../components/ui/card";
import { CreditCard, DollarSign, ShoppingCart } from "lucide-react";

interface SummaryCardsProps {
    data: {
        orderCount: number;
        totalSales: number;
        averageOrderValue: number;
    };
}

export function SummaryCards({ data }: SummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{parseFloat(data.totalSales.toString()).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Revenue for the selected day</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Order Count</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.orderCount}</div>
                    <p className="text-xs text-muted-foreground">Total orders placed</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ৳{parseFloat(data.averageOrderValue.toString()).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Average revenue per order</p>
                </CardContent>
            </Card>
        </div>
    );
}
