"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { OrderActionMenu } from "./order-action-menu";
import { Order } from "@/types/api";

export const columns = (
    onView: (order: Order) => void,
    onPrint: (order: Order) => void,
    onReturn?: (order: Order) => void
): ColumnDef<Order>[] => [
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => {
                const date = row.getValue("date") as string;
                return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
            },
        },
        {
            accessorKey: "supplier_name",
            header: "Supplier",
            cell: ({ row }) => row.getValue("supplier_name") || "N/A",
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <span className="capitalize">{row.getValue("type")}</span>
            ),
        },
        {
            accessorKey: "total_amount",
            header: "Total Amount",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("total_amount"));
                return <span>৳{amount.toLocaleString()}</span>;
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase">
                    {row.getValue("status") || "PENDING"}
                </span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <OrderActionMenu
                    order={row.original}
                    onView={onView}
                    onPrint={onPrint}
                    onReturn={onReturn}
                />
            ),
        },
    ];
