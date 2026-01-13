"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Income } from "@/types/api";

export const columns: ColumnDef<Income>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("date")), "dd MMM yyyy"),
    },
    {
        accessorKey: "source",
        header: "Source",
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => row.getValue("category") || "N/A",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
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
