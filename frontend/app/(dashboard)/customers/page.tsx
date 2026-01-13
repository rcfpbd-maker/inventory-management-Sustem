"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table/data-table";
import { columns } from "./components/customer-columns";
import { CustomerFormDialog } from "./components/customer-form-dialog";
import { useFetchData } from "@/hooks/useFetchData";
import { Customer } from "@/types/api";
import { customerApi } from "@/api/endpoint/customer-api";

const CustomersPage = () => {
    const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Fetch customers
    const {
        data: customers = [],
        isLoading,
        isError,
    } = useFetchData<Customer[]>({
        url: customerApi.GET_ALL,
    });

    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setOpenCustomerDialog(true);
    };

    const handleCreateCustomer = () => {
        setSelectedCustomer(null);
        setOpenCustomerDialog(true);
    };

    const handleViewOrders = (customer: Customer) => {
        // Navigate to customer orders or open a detail view
        console.log("View orders for customer:", customer.id);
        // window.location.href = `/customers/${customer.id}/orders`;
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Customers Management</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleCreateCustomer}>
                        <Plus className="mr-2 h-4 w-4" /> Add Customer
                    </Button>
                </div>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div className="text-destructive">Failed to load customers.</div>
                ) : (
                    <DataTable
                        data={customers}
                        columns={columns(handleEditCustomer, handleViewOrders)}
                        searchKey="name"
                    />
                )}
            </div>

            <CustomerFormDialog
                open={openCustomerDialog}
                onOpenChange={setOpenCustomerDialog}
                customer={selectedCustomer}
            />
        </div>
    );
};

export default CustomersPage;
