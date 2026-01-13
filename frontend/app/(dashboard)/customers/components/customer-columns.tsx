"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/types/api";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomerActionMenu } from "./customer-action-menu";
import { format } from "date-fns";

export const columns = (
    onEdit: (customer: Customer) => void,
    onViewOrders: (customer: Customer) => void
): ColumnDef<Customer>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "createdAt",
            header: "Joined Date",
            cell: ({ row }) => {
                const date = row.getValue("createdAt");
                if (!date) return "N/A";
                return format(new Date(date as string), "MMM d, yyyy");
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <CustomerActionMenu
                    customer={row.original}
                    onEdit={onEdit}
                    onViewOrders={onViewOrders}
                />
            ),
        },
    ];
