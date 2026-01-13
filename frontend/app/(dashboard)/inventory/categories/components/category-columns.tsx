"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Category } from "@/types/api";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryActionMenu } from "./category-action-menu";

export const columns = (
    onEdit: (category: Category) => void
): ColumnDef<Category>[] => [
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
            accessorKey: "parentName",
            header: "Parent Category",
            cell: ({ row }) => {
                const parentName = row.original.parentName; // Assuming API returns parentName
                return parentName || <span className="text-muted-foreground italic">None</span>;
            }
        },
        {
            accessorKey: "description",
            header: "Description",
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <CategoryActionMenu
                    category={row.original}
                    onEdit={onEdit}
                />
            ),
        },
    ];
