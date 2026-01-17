"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePostData } from "@/hooks/useFetchData";
import { courierApi } from "@/api/endpoint/courier-api";
import { Courier } from "./courier-columns";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
});

interface CreateCourierDialogProps {
    courier?: Courier | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateCourierDialog({ courier, open, onOpenChange }: CreateCourierDialogProps) {
    const isEditing = !!courier;

    // Mutation for both Create and Update
    const { mutate: saveData, isPending: isLoading } = usePostData({
        invalidateQueries: [courierApi.GET_ALL],
        onSuccess: () => {
            onOpenChange(false);
            form.reset();
        },
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
        },
    });

    useEffect(() => {
        if (courier) {
            form.reset({
                name: courier.name,
                phone: courier.phone || "",
                email: courier.email || "",
            });
        } else {
            form.reset({
                name: "",
                phone: "",
                email: "",
            });
        }
    }, [courier, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEditing && courier) {
            saveData({
                url: courierApi.UPDATE(courier.id),
                method: "PUT",
                postData: values,
            });
        } else {
            saveData({
                url: courierApi.CREATE,
                method: "POST",
                postData: values,
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Courier" : "Add Courier"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update details of the courier service." : "Add a new courier service provider."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Courier Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. RedX" {...field} />
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
                                        <Input placeholder="e.g. 017..." {...field} />
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
                                        <Input placeholder="support@courier.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
