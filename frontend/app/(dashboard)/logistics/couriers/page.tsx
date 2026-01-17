"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table/data-table";
import { columns, Courier } from "./components/courier-columns";
import { CreateCourierDialog } from "./components/create-courier-dialog";
import { useFetchData, usePostData } from "@/hooks/useFetchData";
import { courierApi } from "@/api/endpoint/courier-api";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CouriersPage = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const {
        data: couriers = [],
        isLoading,
        isError,
    } = useFetchData<Courier[]>({
        url: courierApi.GET_ALL,
    });

    const { mutate: deleteData } = usePostData({
        invalidateQueries: [courierApi.GET_ALL],
    });

    const handleEdit = (courier: Courier) => {
        setSelectedCourier(courier);
        setOpenDialog(true);
    };

    const handleDelete = (courier: Courier) => {
        setDeleteId(courier.id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteData({
                url: courierApi.DELETE(deleteId),
                method: "DELETE",
            });
            setDeleteId(null);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Courier Management</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => { setSelectedCourier(null); setOpenDialog(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Courier
                    </Button>
                </div>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div className="text-destructive">Failed to load couriers.</div>
                ) : (
                    <DataTable
                        data={couriers}
                        columns={columns(handleEdit, handleDelete)}
                        searchKey="name"
                    />
                )}
            </div>

            <CreateCourierDialog
                courier={selectedCourier}
                open={openDialog}
                onOpenChange={setOpenDialog}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the courier
                            and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CouriersPage;
