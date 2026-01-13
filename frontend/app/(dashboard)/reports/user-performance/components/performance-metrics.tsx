"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../../../../components/ui/card";
import { Users, ShoppingCart, TrendingUp } from "lucide-react";

interface PerformanceMetricsProps {
    data: {
        totalStaff: number;
        totalOrders: number;
        totalRevenue: number;
    };
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalStaff}</div>
                    <p className="text-xs text-muted-foreground">Team members with sales</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">Orders confirmed by staff</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ৳{parseFloat(data.totalRevenue.toString()).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Combined team performance</p>
                </CardContent>
            </Card>
        </div>
    );
}
