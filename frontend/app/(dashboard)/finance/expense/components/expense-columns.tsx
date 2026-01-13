"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Expense } from "@/types/api";

export const columns: ColumnDef<Expense>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("date")), "dd MMM yyyy"),
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "vendor",
        header: "Vendor",
        cell: ({ row }) => row.getValue("vendor") || "N/A",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount") as string);
            return new Intl.NumberFormat("en-BD", {
                style: "currency",
                currency: "BDT",
            }).format(amount);
        },
    },
    {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate" title={row.getValue("notes")}>
                {row.getValue("notes") || "-"}
            </div>
        ),
    },
];
