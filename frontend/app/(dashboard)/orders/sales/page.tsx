"use client";

import { useState } from "react";
import { Plus, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table/data-table";
import { columns } from "./components/order-columns";
import { CreateOrderDialog } from "./components/create-order-dialog";
import { OrderDetailsDialog } from "./components/order-details-dialog";
import { useFetchData } from "@/hooks/useFetchData";
import { Order } from "@/types/api";
import { orderApi } from "@/api/endpoint/order-api";

const SalesOrdersPage = () => {
    const [openOrderDialog, setOpenOrderDialog] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    // Fetch orders
    const {
        data: orders = [],
        isLoading,
        isError,
    } = useFetchData<Order[]>({
        url: orderApi.GET_ALL,
    });

    // Fetch single order details
    const { data: selectedOrder } = useFetchData<Order>({
        url: selectedOrderId ? orderApi.GET_BY_ID(selectedOrderId) : "",
        isEnabled: !!selectedOrderId,
    });

    // Filter only sales
    const salesOrders = orders.filter((o: any) => o.type === "SALE" || o.type === "SALE_RETURN");

    const handleCreateOrder = () => {
        setOpenOrderDialog(true);
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrderId(order.id);
        setOpenDetailsDialog(true);
    };

    const handlePrintOrder = (order: Order) => {
        setSelectedOrderId(order.id);
        setOpenDetailsDialog(true);
        // We can trigger print inside the dialog or just show it first
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Sales Orders</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleCreateOrder}>
                        <Plus className="mr-2 h-4 w-4" /> New Sale
                    </Button>
                </div>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div className="text-destructive">Failed to load sales orders.</div>
                ) : (
                    <DataTable
                        data={salesOrders}
                        columns={columns(handleViewOrder, handlePrintOrder)}
                        searchKey="customer_name"
                    />
                )}
            </div>

            <CreateOrderDialog
                open={openOrderDialog}
                onOpenChange={setOpenOrderDialog}
            />

            <OrderDetailsDialog
                order={selectedOrder || null}
                open={openDetailsDialog}
                onOpenChange={(open) => {
                    setOpenDetailsDialog(open);
                    if (!open) setSelectedOrderId(null);
                }}
            />
        </div>
    );
};

export default SalesOrdersPage;
