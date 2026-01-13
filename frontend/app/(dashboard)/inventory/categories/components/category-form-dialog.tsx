"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { usePostData } from "@/hooks/useFetchData";
import { categoryApi } from "@/api/endpoint/category-api";
import { Category } from "@/types/api";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    parentId: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
});

interface CategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category | null;
    categories: Category[];
}

export function CategoryFormDialog({
    open,
    onOpenChange,
    category,
    categories,
}: CategoryFormDialogProps) {
    const isEditing = !!category;

    const { mutate: submitForm, isPending: isLoading } = usePostData({
        invalidateQueries: [categoryApi.GET_ALL],
        onSuccess: () => {
            onOpenChange(false);
            form.reset();
        },
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            parentId: "none",
            description: "",
        },
    });

    useEffect(() => {
        if (category) {
            form.reset({
                name: category.name || "",
                parentId: category.parentId || "none",
                description: category.description || "",
            });
        } else {
            form.reset({
                name: "",
                parentId: "none",
                description: "",
            });
        }
    }, [category, form, open]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        // If parentId is "none", make it null
        const postData = {
            ...values,
            parentId: values.parentId === "none" ? null : values.parentId
        };

        if (isEditing && category) {
            submitForm({
                url: categoryApi.UPDATE(category.id),
                method: "PUT",
                postData,
            });
        } else {
            submitForm({
                url: categoryApi.CREATE,
                method: "POST",
                postData,
            });
        }
    }

    // Filter out the current category from the parent selection to prevent circular hierarchy
    const availableParents = categories.filter(c => !category || c.id !== category.id);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Category" : "Add Category"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the category's details."
                            : "Create a new category for your products."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 pt-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Category Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="parentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parent Category (Optional)</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select parent category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None (Top Level)</SelectItem>
                                            {availableParents.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Category description..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Save changes" : "Create category"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
