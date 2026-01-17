"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { columns } from "../components/return-columns";
import { useFetchData } from "@/hooks/useFetchData";
import { OrderReturn } from "@/types/api";
import { returnApi } from "@/api/endpoint/return-api";

const SalesReturnsPage = () => {
    const {
        data: returns = [],
        isLoading,
        isError,
    } = useFetchData<OrderReturn[]>({
        url: returnApi.GET_ALL,
    });

    const salesReturns = returns.filter((r) => r.type === "SALE_RETURN" || r.type === "SALE_REFUND" || r.type === "RETURN");

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Sales Returns</h2>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div className="text-destructive">Failed to load sales returns.</div>
                ) : (
                    <DataTable
                        data={salesReturns}
                        columns={columns}
                        searchKey="customer_name"
                    />
                )}
            </div>
        </div>
    );
};

export default SalesReturnsPage;
