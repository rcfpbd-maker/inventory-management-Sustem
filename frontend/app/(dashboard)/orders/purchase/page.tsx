"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table/data-table";
import { columns, CreateOrderDialog, OrderDetailsDialog } from "./components";
import { CreateReturnDialog } from "../returns/components";
import { useFetchData } from "@/hooks/useFetchData";
import { Order } from "@/types/api";
import { orderApi } from "@/api/endpoint/order-api";

const PurchaseOrdersPage = () => {
    const [openOrderDialog, setOpenOrderDialog] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [openReturnDialog, setOpenReturnDialog] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

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

    // Filter only purchases
    const purchaseOrders = orders.filter((o: any) => o.type === "PURCHASE" || o.type === "PURCHASE_RETURN");

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
    };

    const handleReturnOrder = (order: Order) => {
        setCurrentOrder(order);
        setOpenReturnDialog(true);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleCreateOrder}>
                        <Plus className="mr-2 h-4 w-4" /> New Purchase
                    </Button>
                </div>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div className="text-destructive">Failed to load purchase orders.</div>
                ) : (
                    <DataTable
                        data={purchaseOrders}
                        columns={columns(handleViewOrder, handlePrintOrder, handleReturnOrder)}
                        searchKey="supplier_name"
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
                onOpenChange={(open: boolean) => {
                    setOpenDetailsDialog(open);
                    if (!open) setSelectedOrderId(null);
                }}
            />

            <CreateReturnDialog
                order={currentOrder}
                open={openReturnDialog}
                onOpenChange={setOpenReturnDialog}
            />
        </div>
    );
};

export default PurchaseOrdersPage;
