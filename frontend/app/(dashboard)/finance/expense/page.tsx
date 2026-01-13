"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { DataTable } from "../../../../components/common/data-table/data-table";
import { useFetchData } from "../../../../hooks/useFetchData";
import { Expense } from "../../../../types/api";
import { expenseApi } from "../../../../api/endpoint/expense-api";
import { columns, CreateExpenseDialog } from "./components";

const ExpensePage = () => {
    const [open, setOpen] = useState(false);
    const {
        data: expenseRecords = [],
        isLoading,
        isError,
    } = useFetchData<Expense[]>({
        url: expenseApi.GET_ALL,
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Expense Management</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                </div>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div className="text-destructive">Failed to load expense records.</div>
                ) : (
                    <DataTable
                        data={expenseRecords}
                        columns={columns}
                        searchKey="category"
                    />
                )}
            </div>

            <CreateExpenseDialog open={open} onOpenChange={setOpen} />
        </div>
    );
};

export default ExpensePage;
