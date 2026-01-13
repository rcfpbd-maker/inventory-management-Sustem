"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Order } from "@/types/api";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderDetailsDialogProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({
    order,
    open,
    onOpenChange,
}: OrderDetailsDialogProps) {
    if (!order) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle>Order Details</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            Order ID: {order.id}
                        </p>
                    </div>
                    <Button onClick={handlePrint} variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                </DialogHeader>
                <div className="space-y-6 py-4" id="printable-invoice">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
                                Customer Details
                            </h3>
                            <p className="font-medium">{order.customer_name || "Walk-in Customer"}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
                                Order Information
                            </h3>
                            <p><span className="font-medium">Date:</span> {order.date ? format(new Date(order.date), "PPP") : "N/A"}</p>
                            <p><span className="font-medium">Type:</span> {order.type}</p>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-2 text-left">Product</th>
                                    <th className="px-4 py-2 text-right">Qty</th>
                                    <th className="px-4 py-2 text-right">Price</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {order.items?.map((item: any, index: number) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2">{item.product_name || "Unknown Product"}</td>
                                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                                        <td className="px-4 py-2 text-right">৳{parseFloat(item.price as string).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-right">৳{parseFloat(item.total as string).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-muted/50 font-bold">
                                <tr>
                                    <td colSpan={3} className="px-4 py-2 text-right uppercase">Grand Total</td>
                                    <td className="px-4 py-2 text-right">৳{parseFloat(order.total_amount as string).toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
