"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Order, Payment } from "@/types/api";
import { format } from "date-fns";
import { Printer, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { paymentApi } from "@/api/endpoint/payment-api";
import { AddPaymentDialog } from "./add-payment-dialog";
import { PaymentHistory } from "./payment-history";

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
    const [payments, setPayments] = useState<Payment[]>([]);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [loadingPayments, setLoadingPayments] = useState(false);

    if (!order) return null;

    useEffect(() => {
        if (order && open) {
            fetchPayments();
        }
    }, [order, open]);

    const fetchPayments = async () => {
        if (!order) return;
        setLoadingPayments(true);
        try {
            const response = await axios.get(paymentApi.GET_BY_ORDER(order.id), {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setPayments(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoadingPayments(false);
        }
    };

    const totalPaid = payments.reduce(
        (sum, payment) => sum + parseFloat(payment.amount.toString()),
        0
    );

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
                            <p className="font-medium text-lg">{order.customer_name || "Walk-in Customer"}</p>
                            {order.customer_phone && <p className="text-sm">Phone: {order.customer_phone}</p>}
                        </div>
                        <div className="text-right">
                            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
                                Order Information
                            </h3>
                            <p><span className="font-medium">Date:</span> {order.date ? format(new Date(order.date), "PPP") : "N/A"}</p>
                            <p><span className="font-medium">Type:</span> {order.type}</p>
                            <div className="mt-2 space-y-1">
                                <p className="text-sm">
                                    <span className="font-semibold">Order Status:</span>{" "}
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                                        {order.status}
                                    </span>
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">Payment Status:</span>{" "}
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                                        {order.payment_status || "UNPAID"}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {order.courier_name && (
                        <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
                            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
                                Delivery Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <p><span className="font-medium">Courier:</span> {order.courier_name}</p>
                                <p><span className="font-medium">Tracking ID:</span> {order.tracking_id || "N/A"}</p>
                            </div>
                        </div>
                    )}

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

                    {/* Payment Tracking Section */}
                    <div className="mt-6 space-y-4 border-t pt-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Payment Tracking</h3>
                            <Button
                                onClick={() => setShowAddPayment(true)}
                                size="sm"
                                variant="outline"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Payment
                            </Button>
                        </div>
                        {loadingPayments ? (
                            <div className="text-center py-4 text-muted-foreground">
                                Loading payments...
                            </div>
                        ) : (
                            <PaymentHistory
                                payments={payments}
                                orderTotal={parseFloat(order.total_amount.toString())}
                            />
                        )}
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
                                }
                            }
                        `
                    }} />
                </div>

                <AddPaymentDialog
                    open={showAddPayment}
                    onOpenChange={setShowAddPayment}
                    orderId={order.id}
                    orderTotal={parseFloat(order.total_amount.toString())}
                    totalPaid={totalPaid}
                    onSuccess={fetchPayments}
                />
            </DialogContent>
        </Dialog>
    );
}
