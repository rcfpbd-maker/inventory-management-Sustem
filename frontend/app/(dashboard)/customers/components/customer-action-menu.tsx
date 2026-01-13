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
import { Customer } from "@/types/api";
import { usePostData } from "@/hooks/useFetchData";
import { customerApi } from "@/api/endpoint/customer-api";

interface CustomerActionMenuProps {
    customer: Customer;
    onEdit: (customer: Customer) => void;
    onViewOrders: (customer: Customer) => void;
}

export function CustomerActionMenu({
    customer,
    onEdit,
    onViewOrders,
}: CustomerActionMenuProps) {
    const { mutate: deleteCustomer, isPending: isDeleting } = usePostData({
        invalidateQueries: [customerApi.GET_ALL],
        onSuccess: () => {
            // Toast is handled by usePostData
        },
    });

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this customer?")) {
            deleteCustomer({
                url: customerApi.DELETE(customer.id),
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
                <DropdownMenuItem onClick={() => onEdit(customer)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewOrders(customer)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Orders
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
