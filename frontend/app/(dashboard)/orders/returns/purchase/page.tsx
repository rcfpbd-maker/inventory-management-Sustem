"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { columns } from "../components/return-columns";
import { useFetchData } from "@/hooks/useFetchData";
import { OrderReturn } from "@/types/api";
import { returnApi } from "@/api/endpoint/return-api";

const PurchaseReturnsPage = () => {
    const {
        data: returns = [],
        isLoading,
        isError,
    } = useFetchData<OrderReturn[]>({
        url: returnApi.GET_ALL,
    });

    const purchaseReturns = returns.filter((r) => r.type === "PURCHASE_RETURN");

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Purchase Returns</h2>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div className="text-destructive">Failed to load purchase returns.</div>
                ) : (
                    <DataTable
                        data={purchaseReturns}
                        columns={columns}
                        searchKey="supplier_name"
                    />
                )}
            </div>
        </div>
    );
};

export default PurchaseReturnsPage;
