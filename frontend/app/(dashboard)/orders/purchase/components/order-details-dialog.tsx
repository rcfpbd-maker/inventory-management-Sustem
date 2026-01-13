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
                        <DialogTitle>Purchase Order Details</DialogTitle>
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
                                Supplier Details
                            </h3>
                            <p className="font-medium text-lg">{order.supplier_name || "N/A"}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
                                Order Information
                            </h3>
                            <p><span className="font-medium">Date:</span> {order.date ? format(new Date(order.date), "PPP") : "N/A"}</p>
                            <p><span className="font-medium">Type:</span> {order.type}</p>
                            <div className="mt-2 space-y-1">
                                <p className="text-sm">
                                    <span className="font-semibold">Status:</span>{" "}
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                                        {order.status}
                                    </span>
                                </p>
                            </div>
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

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #printable-invoice, #printable-invoice * {
                            visibility: visible;
                        }
                        #printable-invoice {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 20px;
                        }
                    }
                ` }} />
            </DialogContent>
        </Dialog>
    );
}
