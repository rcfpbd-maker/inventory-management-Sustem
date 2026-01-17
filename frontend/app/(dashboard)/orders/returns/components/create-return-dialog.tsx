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
import { returnApi } from "@/api/endpoint/return-api";
import { orderApi } from "@/api/endpoint/order-api";
import { Order } from "@/types/api";

const formSchema = z.object({
    amount: z.number().min(0, "Amount cannot be negative"),
    reason: z.string().min(1, "Reason is required"),
}).superRefine((data, ctx) => {
    // We'll access the order total from the component context or passing it differently if strictly using Zod solo,
    // but typically for Zod we need the context. Actually, simpler to leave this basic validation here
    // and do the logic validation in the component or via a refinement if we pass the max value.
    // For simplicity with react-hook-form, we often do custom validation in the submit or use a schema creator function.
});

// Better approach to allow dynamic max validation:
const createFormSchema = (maxAmount: number) => z.object({
    type: z.enum(["RETURN", "REFUND"]),
    amount: z.number()
        .min(0, "Amount cannot be negative")
        .max(maxAmount, `Amount cannot exceed order total (${maxAmount})`),
    reason: z.string().min(1, "Reason is required"),
});

interface CreateReturnDialogProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateReturnDialog({ order, open, onOpenChange }: CreateReturnDialogProps) {
    const { mutate: createReturn, isPending: isLoading } = usePostData({
        invalidateQueries: [orderApi.GET_ALL, returnApi.GET_ALL],
        onSuccess: () => {
            onOpenChange(false);
            form.reset();
        },
    });

    const maxAmount = order ? Number(order.total_amount) : 0;
    const schema = createFormSchema(maxAmount);

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: "RETURN",
            amount: 0,
            reason: "",
        },
    });

    // Update amount when order changes
    useEffect(() => {
        if (order) {
            form.setValue("amount", Number(order.total_amount));
        }
    }, [order, form]);

    function onSubmit(values: z.infer<typeof schema>) {
        if (!order) return;

        // Construct the backend type based on decision
        // format: SALE_RETURN (Stock) vs SALE_REFUND (No Stock)
        const baseType = order.type === "SALE" ? "SALE" : "PURCHASE";
        const finalType = `${baseType}_${values.type}`; // SALE_RETURN or SALE_REFUND

        createReturn({
            url: returnApi.CREATE,
            method: "POST",
            postData: {
                orderId: order.id,
                type: finalType,
                amount: values.amount,
                reason: values.reason,
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record {order?.type === "SALE" ? "Sales" : "Purchase"} Return</DialogTitle>
                    <DialogDescription>
                        Process a return for Order #{order?.id.slice(0, 8)}. This will update stock and mark the order as returned.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Return Type</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 border p-3 rounded-md cursor-pointer hover:bg-muted/50 transition-colors w-full">
                                                <input
                                                    type="radio"
                                                    className="accent-primary"
                                                    checked={field.value === "RETURN"}
                                                    onChange={() => field.onChange("RETURN")}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">Return Items</span>
                                                    <span className="text-xs text-muted-foreground">Restock items & refund</span>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-2 border p-3 rounded-md cursor-pointer hover:bg-muted/50 transition-colors w-full">
                                                <input
                                                    type="radio"
                                                    className="accent-primary"
                                                    checked={field.value === "REFUND"}
                                                    onChange={() => field.onChange("REFUND")}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">Refund Only</span>
                                                    <span className="text-xs text-muted-foreground">Money back, no stock</span>
                                                </div>
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Refund Amount (৳)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason for Return</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Damaged product, Customer changed mind" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Return
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
