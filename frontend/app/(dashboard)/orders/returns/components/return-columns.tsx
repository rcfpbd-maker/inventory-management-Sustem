"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { OrderReturn } from "@/types/api";

export const columns: ColumnDef<OrderReturn>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            const date = row.getValue("date") as string;
            return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
        },
    },
    {
        header: "Entity",
        cell: ({ row }) => {
            const data = row.original;
            return data.customer_name || data.supplier_name || "N/A";
        },
    },
    {
        accessorKey: "order_id",
        header: "Order ID",
        cell: ({ row }) => {
            const id = row.getValue("order_id") as string;
            return <span className="font-mono text-xs">{id?.slice(0, 8)}</span>;
        },
    },
    {
        accessorKey: "amount",
        header: "Refund Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            return <span>৳{amount.toLocaleString()}</span>;
        },
    },
    {
        accessorKey: "reason",
        header: "Reason",
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
            <span className="capitalize">{(row.getValue("type") as string)?.replace("_", " ")}</span>
        ),
    },
];
