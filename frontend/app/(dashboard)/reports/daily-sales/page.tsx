"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Calendar } from "../../../../components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../../components/ui/popover";
import { useFetchData } from "../../../../hooks/useFetchData";
import { DailySalesData } from "../../../../types/api";
import { reportApi } from "../../../../api/endpoint/report-api";
import {
    SalesChart,
    ProductBreakdown,
    SummaryCards,
} from "./components";
import { cn } from "../../../../lib/utils";

const DailySalesPage = () => {
    const [date, setDate] = useState<Date>(new Date());

    const formattedDate = format(date, "yyyy-MM-dd");

    const {
        data: reportData,
        isLoading,
        isError,
    } = useFetchData<DailySalesData>({
        url: reportApi.DAILY_SALES(formattedDate),
    });

    if (isLoading) return <div className="p-8">Loading report data...</div>;
    if (isError || !reportData) return <div className="p-8 text-destructive">Failed to load report data.</div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Daily Sales Report</h2>
                <div className="flex items-center space-x-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            <SummaryCards data={reportData.summary} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <SalesChart data={reportData.hourlySales} />
                <ProductBreakdown data={reportData.productBreakdown} />
            </div>
        </div>
    );
};

export default DailySalesPage;
