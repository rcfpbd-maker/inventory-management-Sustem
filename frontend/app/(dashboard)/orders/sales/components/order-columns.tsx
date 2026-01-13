"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/types/api";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderActionMenu } from "./order-action-menu";
import { format } from "date-fns";

export const columns = (
    onView: (order: Order) => void,
    onPrint: (order: Order) => void
): ColumnDef<any>[] => [
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
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => {
                try {
                    return format(new Date(row.getValue("date")), "PPP");
                } catch {
                    return row.getValue("date");
                }
            },
        },
        {
            accessorKey: "customer_name",
            header: "Customer",
            cell: ({ row }) => row.getValue("customer_name") || <span className="text-muted-foreground italic">Walk-in</span>,
        },
        {
            accessorKey: "total_amount",
            header: "Total Amount",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("total_amount"));
                const formatted = new Intl.NumberFormat("en-BD", {
                    style: "currency",
                    currency: "BDT",
                }).format(amount);
                return <div className="font-medium">{formatted}</div>;
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <OrderActionMenu
                    order={row.original}
                    onView={onView}
                    onPrint={onPrint}
                />
            ),
        },
    ];
