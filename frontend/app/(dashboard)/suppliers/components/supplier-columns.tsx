"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Supplier } from "@/types/api";
import { Checkbox } from "@/components/ui/checkbox";
import { SupplierActionMenu } from "./supplier-action-menu";
import { format } from "date-fns";

export const columns = (
    onEdit: (supplier: Supplier) => void,
    onViewPurchases: (supplier: Supplier) => void
): ColumnDef<Supplier>[] => [
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
                <SupplierActionMenu
                    supplier={row.original}
                    onEdit={onEdit}
                    onViewPurchases={onViewPurchases}
                />
            ),
        },
    ];
