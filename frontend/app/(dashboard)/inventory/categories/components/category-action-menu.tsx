"use client";

import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Category } from "@/types/api";
import { usePostData } from "@/hooks/useFetchData";
import { categoryApi } from "@/api/endpoint/category-api";

interface CategoryActionMenuProps {
    category: Category;
    onEdit: (category: Category) => void;
}

export function CategoryActionMenu({
    category,
    onEdit,
}: CategoryActionMenuProps) {
    const { mutate: deleteCategory, isPending: isDeleting } = usePostData({
        invalidateQueries: [categoryApi.GET_ALL],
        onSuccess: () => {
            // Toast notification is handled by usePostData
        },
    });

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this category?")) {
            deleteCategory({
                url: categoryApi.DELETE(category.id),
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
                <DropdownMenuItem onClick={() => onEdit(category)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
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
