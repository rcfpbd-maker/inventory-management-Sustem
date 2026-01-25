"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { usePostData, useFetchData } from "@/hooks/useFetchData";
import { orderApi } from "@/api/endpoint/order-api";
import { customerApi } from "@/api/endpoint/customer-api";
import { productApi } from "@/api/endpoint/product-api";
import { Customer, Product } from "@/types/api";

const itemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    price: z.coerce.number().min(0, "Price cannot be negative"),
});

const formSchema = z.object({
    customerName: z.string().min(1, "Customer name is required"),
    customerId: z.string().optional(),
    area: z.string().optional(),
    thana: z.string().optional(),
    district: z.string().optional(),
    notes: z.string().optional(),
    courierId: z.string().min(1, "Courier is required"),
    trackingId: z.string().optional(),
    courierCharge: z.coerce.number().min(0, "Charge cannot be negative"),
    paymentMethod: z.string().min(1, "Payment method is required"),
    paymentReference: z.string().optional(),
    amountPaid: z.coerce.number().min(0),
    platform: z.string().optional(),
    deliveryType: z.string().optional(),
    items: z.array(itemSchema).min(1, "At least one item is required"),
});

interface OrderFormValues {
    customerName: string;
    customerPhone?: string;
    customerId?: string;
    area?: string;
    thana?: string;
    district?: string;
    notes?: string;
    courierId: string;
    trackingId?: string;
    courierCharge: number;
    paymentMethod: string;
    paymentReference?: string;
    amountPaid: number;
    platform?: string;
    deliveryType?: string;
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
}

interface CreateOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
    const { data: customers = [] } = useFetchData<Customer[]>({
        url: customerApi.GET_ALL,
    });

    const { data: products = [] } = useFetchData<Product[]>({
        url: productApi.GET_ALL,
    });

    const { mutate: createOrder, isPending: isLoading } = usePostData({
        invalidateQueries: [orderApi.GET_ALL],
        onSuccess: () => {
            onOpenChange(false);
            form.reset();
        },
    });

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            customerName: "",
            customerPhone: "",
            customerId: "",
            area: "",
            thana: "",
            district: "",
            notes: "",
            courierId: "",
            trackingId: "",
            courierCharge: 60,
            paymentMethod: "Cash on Delivery",
            paymentReference: "",
            amountPaid: 0,
            platform: "Direct",
            deliveryType: "Standard",
            items: [{ productId: "", quantity: 1, price: 0 }],
        } as OrderFormValues,
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const watchItems = form.watch("items");
    const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const courierCharge = form.watch("courierCharge");
    const amountPaid = form.watch("amountPaid");

    function onSubmit(values: OrderFormValues) {
        createOrder({
            url: orderApi.CREATE,
            method: "POST",
            postData: {
                ...values,
                type: "SALE",
                // Pass base calculations, let backend validate final total
                totalAmount: subtotal + (values.courierCharge || 0),
                platform: values.platform || "Direct",
                deliveryType: values.deliveryType || "Standard",
                // Explicitly pass these for the "create on fly" logic
                customerName: values.customerName,
                customerPhone: values.customerPhone,
                courierCharge: values.courierCharge,
                amountPaid: values.amountPaid
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[95vw] lg:max-w-[80vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Sales Order</DialogTitle>
                    <DialogDescription>
                        Complete all details to create a new sales order.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <section className="space-y-4 rounded-lg border p-4 bg-muted/50">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Customer Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="customerName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Customer Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="customerPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="017..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="area"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Area</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Area" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="thana"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Thana</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Thana" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="district"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>District</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="District" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </section>

                                <section className="space-y-4 rounded-lg border p-4 bg-muted/50">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Delivery Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="platform"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Platform</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Direct">Direct</SelectItem>
                                                            <SelectItem value="Facebook">Facebook</SelectItem>
                                                            <SelectItem value="Website">Website</SelectItem>
                                                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="deliveryType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Standard">Standard</SelectItem>
                                                            <SelectItem value="Express">Express</SelectItem>
                                                            <SelectItem value="COD">COD</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="courierId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Courier</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Select courier" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="redx">RedX</SelectItem>
                                                        <SelectItem value="steadfast">Steadfast</SelectItem>
                                                        <SelectItem value="pathao">Pathao</SelectItem>
                                                        <SelectItem value="paperfly">Paperfly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="trackingId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tracking ID</FormLabel>
                                                    <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="courierCharge"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Charge</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </section>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <section className="space-y-4 rounded-lg border p-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Order Items</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 1, price: 0 })}>
                                            <Plus className="mr-1 h-3 w-3" /> Add Item
                                        </Button>
                                    </div>
                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-12 gap-2 items-start border-b pb-3 last:border-0">
                                                <div className="col-span-6">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.productId`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select
                                                                    onValueChange={(val) => {
                                                                        field.onChange(val);
                                                                        const p = products.find(prod => prod.id === val);
                                                                        if (p) form.setValue(`items.${index}.price`, Number(p.price || 0));
                                                                    }}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <FormControl><SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.stock || 0})</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.quantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.price`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-span-1 pt-1">
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(index)} disabled={fields.length === 1}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-4 rounded-lg border p-4 bg-muted/50">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Payment Information</h3>
                                    <FormField
                                        control={form.control}
                                        name="paymentMethod"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Method</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Cash">Cash</SelectItem>
                                                        <SelectItem value="Cash on Delivery">COD</SelectItem>
                                                        <SelectItem value="Bkash">Bkash</SelectItem>
                                                        <SelectItem value="Nagad">Nagad</SelectItem>
                                                        <SelectItem value="Rocket">Rocket</SelectItem>
                                                        <SelectItem value="Bank">Bank</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="paymentReference"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Reference #</FormLabel>
                                                    <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="amountPaid"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Amount Paid</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </section>

                                <section className="p-4 rounded-lg border border-dashed bg-primary/5">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider mb-2">Order Summary</h3>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between text-muted-foreground"><span>Subtotal:</span><span>৳{subtotal.toLocaleString()}</span></div>
                                        <div className="flex justify-between text-muted-foreground"><span>Courier Charge:</span><span>৳{courierCharge.toLocaleString()}</span></div>
                                        <div className="flex justify-between font-bold text-lg pt-1 border-t mt-1"><span>Total Payable:</span><span className="text-primary">৳{(subtotal + courierCharge).toLocaleString()}</span></div>
                                        {(subtotal + courierCharge - amountPaid > 0) && (
                                            <div className="flex justify-between text-destructive font-semibold pt-1"><span>Remaining Due:</span><span>৳{(subtotal + courierCharge - amountPaid).toLocaleString()}</span></div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>

                        <DialogFooter className="pt-6 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading} className="px-8">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm & Create Order
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
