"use client";

import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../components/ui/select";
import { useFetchData } from "../../../../hooks/useFetchData";
import { UserPerformanceData } from "../../../../types/api";
import { reportApi } from "../../../../api/endpoint/report-api";
import { StaffLeaderboard, PerformanceMetrics } from "./components";

const UserPerformancePage = () => {
    const [period, setPeriod] = useState<string>("monthly");

    const {
        data: reportData,
        isLoading,
        isError,
    } = useFetchData<UserPerformanceData>({
        url: reportApi.USER_PERFORMANCE(period),
    });

    if (isLoading) return <div className="p-8">Loading performance data...</div>;
    if (isError || !reportData) return <div className="p-8 text-destructive">Failed to load performance data.</div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">User Performance Report</h2>
                <div className="flex items-center space-x-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {reportData.summary && <PerformanceMetrics data={reportData.summary} />}

            {reportData.leaderboard && (
                <div className="mt-4">
                    <StaffLeaderboard data={reportData.leaderboard} />
                </div>
            )}
        </div>
    );
};

export default UserPerformancePage;
