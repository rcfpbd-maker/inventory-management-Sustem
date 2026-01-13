"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table/data-table";
import { columns } from "./components/supplier-columns";
import { SupplierFormDialog } from "./components/supplier-form-dialog";
import { useFetchData } from "@/hooks/useFetchData";
import { Supplier } from "@/types/api";
import { supplierApi } from "@/api/endpoint/supplier-api";

const SuppliersPage = () => {
    const [openSupplierDialog, setOpenSupplierDialog] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    // Fetch suppliers
    const {
        data: suppliers = [],
        isLoading,
        isError,
    } = useFetchData<Supplier[]>({
        url: supplierApi.GET_ALL,
    });

    const handleEditSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setOpenSupplierDialog(true);
    };

    const handleCreateSupplier = () => {
        setSelectedSupplier(null);
        setOpenSupplierDialog(true);
    };

    const handleViewPurchases = (supplier: Supplier) => {
        console.log("View purchases for supplier:", supplier.id);
        // Integration for future purchase history view
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Suppliers Management</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleCreateSupplier}>
                        <Plus className="mr-2 h-4 w-4" /> Add Supplier
                    </Button>
                </div>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div className="text-destructive">Failed to load suppliers.</div>
                ) : (
                    <DataTable
                        data={suppliers}
                        columns={columns(handleEditSupplier, handleViewPurchases)}
                        searchKey="name"
                    />
                )}
            </div>

            <SupplierFormDialog
                open={openSupplierDialog}
                onOpenChange={setOpenSupplierDialog}
                supplier={selectedSupplier}
            />
        </div>
    );
};

export default SuppliersPage;
