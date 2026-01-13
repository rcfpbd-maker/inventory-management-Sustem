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
import { usePostData } from "@/hooks/useFetchData";
import { supplierApi } from "@/api/endpoint/supplier-api";
import { Supplier } from "@/types/api";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }).optional().or(z.literal("")),
    phone: z.string().min(5, {
        message: "Phone number must be at least 5 characters.",
    }).optional().or(z.literal("")),
});

interface SupplierFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier: Supplier | null;
}

export function SupplierFormDialog({
    open,
    onOpenChange,
    supplier,
}: SupplierFormDialogProps) {
    const isEditing = !!supplier;

    const { mutate: submitForm, isPending: isLoading } = usePostData({
        invalidateQueries: [supplierApi.GET_ALL],
        onSuccess: () => {
            onOpenChange(false);
            form.reset();
        },
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        },
    });

    useEffect(() => {
        if (supplier) {
            form.reset({
                name: supplier.name || "",
                email: supplier.email || "",
                phone: supplier.phone || "",
            });
        } else {
            form.reset({
                name: "",
                email: "",
                phone: "",
            });
        }
    }, [supplier, form, open]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEditing && supplier) {
            submitForm({
                url: supplierApi.UPDATE(supplier.id),
                method: "PUT",
                postData: values,
            });
        } else {
            submitForm({
                url: supplierApi.CREATE,
                method: "POST",
                postData: values,
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the supplier's contact information."
                            : "Add a new supplier to the system."}
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
                                        <Input placeholder="Supplier Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="supplier@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 234 567 890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Save changes" : "Create supplier"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
