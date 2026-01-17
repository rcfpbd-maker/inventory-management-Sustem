"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "../../../../../components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../../../../components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../../../../components/ui/dialog";
import { Input } from "../../../../../components/ui/input";
import { usePostData } from "../../../../../hooks/useFetchData";
import { expenseApi } from "../../../../../api/endpoint/expense-api";

const formSchema = z.object({
    category: z.string().min(1, "Category is required"),
    amount: z.number().min(0, "Amount must be at least 0"),
    vendor: z.string().optional(),
    notes: z.string().optional(),
    date: z.string().optional(),
    productCost: z.number().optional(),
    packagingCost: z.number().optional(),
    courierCost: z.number().optional(),
    adCost: z.number().optional(),
});

interface CreateExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateExpenseDialog({ open, onOpenChange }: CreateExpenseDialogProps) {
    const { mutate: createExpense, isPending: isLoading } = usePostData({
        invalidateQueries: [expenseApi.GET_ALL],
        onSuccess: () => {
            onOpenChange(false);
            form.reset();
        },
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category: "",
            amount: 0,
            vendor: "",
            notes: "",
            date: new Date().toISOString().split("T")[0],
            productCost: 0,
            packagingCost: 0,
            courierCost: 0,
            adCost: 0,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        createExpense({
            url: expenseApi.CREATE,
            method: "POST",
            postData: values,
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                    <DialogDescription>
                        Record a new expense entry for your finance records.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Rent, Electricity, Salaries" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="vendor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vendor (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Digital Ocean, Office Supply Co." {...field} />
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
                                    <FormLabel>Amount (৳)</FormLabel>
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
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="border rounded-md p-4 space-y-4 bg-muted/20">
                            <h4 className="font-medium text-sm text-muted-foreground">Cost Breakdown (Optional)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="productCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Product Cost</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="packagingCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Packaging Cost</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="courierCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Courier Cost</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="adCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Ad Cost</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Extra context for this expense" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Expense
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
