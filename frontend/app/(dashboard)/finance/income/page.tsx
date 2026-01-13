"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { DataTable } from "../../../../components/common/data-table/data-table";
import { useFetchData } from "../../../../hooks/useFetchData";
import { Income } from "../../../../types/api";
import { incomeApi } from "../../../../api/endpoint/income-api";
import { columns, CreateIncomeDialog } from "./components";

const IncomePage = () => {
    const [open, setOpen] = useState(false);
    const {
        data: incomeRecords = [],
        isLoading,
        isError,
    } = useFetchData<Income[]>({
        url: incomeApi.GET_ALL,
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Income Management</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Income
                    </Button>
                </div>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div className="text-destructive">Failed to load income records.</div>
                ) : (
                    <DataTable
                        data={incomeRecords}
                        columns={columns}
                        searchKey="source"
                    />
                )}
            </div>

            <CreateIncomeDialog open={open} onOpenChange={setOpen} />
        </div>
    );
};

export default IncomePage;
