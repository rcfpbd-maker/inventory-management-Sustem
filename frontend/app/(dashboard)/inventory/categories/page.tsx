"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table/data-table";
import { columns } from "./components/category-columns";
import { CategoryFormDialog } from "./components/category-form-dialog";
import { useFetchData } from "@/hooks/useFetchData";
import { Category } from "@/types/api";
import { categoryApi } from "@/api/endpoint/category-api";

const CategoriesPage = () => {
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Fetch categories
    const {
        data: categories = [],
        isLoading,
        isError,
    } = useFetchData<Category[]>({
        url: categoryApi.GET_ALL,
    });

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setOpenCategoryDialog(true);
    };

    const handleCreateCategory = () => {
        setSelectedCategory(null);
        setOpenCategoryDialog(true);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Categories Management</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleCreateCategory}>
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                </div>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div className="text-destructive">Failed to load categories.</div>
                ) : (
                    <DataTable
                        data={categories}
                        columns={columns(handleEditCategory)}
                        searchKey="name"
                    />
                )}
            </div>

            <CategoryFormDialog
                open={openCategoryDialog}
                onOpenChange={setOpenCategoryDialog}
                category={selectedCategory}
                categories={categories}
            />
        </div>
    );
};

export default CategoriesPage;
