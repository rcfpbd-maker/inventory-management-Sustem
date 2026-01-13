"use client";

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";

interface SalesChartProps {
    data: { hour: number; sales: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
    // Fill in missing hours to ensure the chart shows the full 24h cycle
    const fullData = Array.from({ length: 24 }, (_, i) => {
        const hourData = data.find((d) => d.hour === i);
        return {
            hour: `${i}:00`,
            sales: hourData ? parseFloat(hourData.sales.toString()) : 0,
        };
    });

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Hourly Sales</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={fullData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="hour"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `৳${value}`}
                        />
                        <Tooltip
                            formatter={(value: any) => [`৳${value}`, "Sales"]}
                            contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                        />
                        <Bar
                            dataKey="sales"
                            fill="currentColor"
                            radius={[4, 4, 0, 0]}
                            className="fill-primary"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
