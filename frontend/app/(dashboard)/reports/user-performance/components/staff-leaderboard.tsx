"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../../../../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { StaffMetrics } from "../../../../../types/api";

interface StaffLeaderboardProps {
    data: StaffMetrics[];
}

export function StaffLeaderboard({ data }: StaffLeaderboardProps) {
    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 1:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 2:
                return <Award className="h-5 w-5 text-amber-600" />;
            default:
                return null;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Staff Leaderboard</CardTitle>
                <CardDescription>Top performing team members</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">Rank</TableHead>
                            <TableHead>Staff Member</TableHead>
                            <TableHead className="text-right">Orders</TableHead>
                            <TableHead className="text-right">Total Sales</TableHead>
                            <TableHead className="text-right">Avg Order</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No performance data for this period.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((staff, index) => (
                                <TableRow key={staff.userId}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getRankIcon(index)}
                                            <span className="font-medium">{index + 1}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{staff.staffName}</div>
                                            {staff.email && (
                                                <div className="text-xs text-muted-foreground">{staff.email}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary">{staff.orderCount}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ৳{parseFloat(staff.totalSales.toString()).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        ৳{parseFloat(staff.averageOrderValue.toString()).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
