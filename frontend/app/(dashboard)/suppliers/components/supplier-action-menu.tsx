"use client";

import { MoreHorizontal, Pencil, Trash, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Supplier } from "@/types/api";
import { usePostData } from "@/hooks/useFetchData";
import { supplierApi } from "@/api/endpoint/supplier-api";

interface SupplierActionMenuProps {
    supplier: Supplier;
    onEdit: (supplier: Supplier) => void;
    onViewPurchases: (supplier: Supplier) => void;
}

export function SupplierActionMenu({
    supplier,
    onEdit,
    onViewPurchases,
}: SupplierActionMenuProps) {
    const { mutate: deleteSupplier, isPending: isDeleting } = usePostData({
        invalidateQueries: [supplierApi.GET_ALL],
        onSuccess: () => {
            // Toast notification is handled by usePostData
        },
    });

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this supplier?")) {
            deleteSupplier({
                url: supplierApi.DELETE(supplier.id),
                method: "DELETE",
            });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(supplier)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewPurchases(supplier)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Purchases
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
