"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Order, Payment } from "@/types/api";
import { format } from "date-fns";
import { Printer, Plus, CreditCard, Receipt, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { paymentApi } from "@/api/endpoint/payment-api";
import { AddPaymentDialog } from "./add-payment-dialog";
import { PaymentHistory } from "./payment-history";
import { OrderStatusManager } from "./order-status-manager";
import { useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/api/endpoint/order-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    const queryClient = useQueryClient();

    const handleStatusUpdate = () => {
        // Invalidate order queries to refresh data
        queryClient.invalidateQueries({ queryKey: [orderApi.GET_ALL] });
        if (order) {
            queryClient.invalidateQueries({ queryKey: [orderApi.GET_BY_ID(order.id)] });
        }
    };

    const fetchPayments = async () => {
        if (!order) return;
        setLoadingPayments(true);
        try {
            const response = await api.get(paymentApi.GET_BY_ORDER(order.id));
            setPayments(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoadingPayments(false);
        }
    };

    useEffect(() => {
        if (order && open) {
            fetchPayments();
        }
    }, [order, open]);

    if (!order) return null;

    const totalPaid = payments.reduce(
        (sum, payment) => sum + parseFloat(payment.amount.toString()),
        0
    );

    const subtotal = parseFloat(order.total_amount.toString());
    const courierCharge = parseFloat((order.courier_charge || 0).toString());
    const grandTotal = subtotal + courierCharge;
    const dueAmount = Math.max(0, grandTotal - totalPaid);

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] lg:max-w-[1200px] max-h-[95vh] overflow-y-auto">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
                                Customer Details
                            </h3>
                            <p className="font-medium text-lg">{order.customer_name || "Walk-in Customer"}</p>
                            {order.customer_phone && <p className="text-sm">Phone: {order.customer_phone}</p>}
                            {order.shipping_address && <p className="text-sm text-muted-foreground mt-1">Shipping: {order.shipping_address}</p>}
                        </div>
                        <div className="text-right">
                            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
                                Order Information
                            </h3>
                            <p><span className="font-medium">Date:</span> {order.date ? format(new Date(order.date), "PPP") : "N/A"}</p>
                            <p><span className="font-medium">Type:</span> {order.type}</p>
                            <div className="mt-2 text-sm text-muted-foreground">
                                {order.platform && <span>via {order.platform} | </span>}
                                <span>{order.delivery_type || "Standard"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary Card */}
                    <Card className="bg-muted/5 border-primary/10">
                        <CardHeader className="py-3 bg-muted/10">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-primary" /> Financial Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Subtotal</p>
                                <p className="text-sm font-semibold">৳{subtotal.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Courier Charge</p>
                                <p className="text-sm font-semibold">৳{courierCharge.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Grand Total</p>
                                <p className="text-sm font-bold text-primary">৳{grandTotal.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase">Paid Amount</p>
                                <p className="text-sm font-semibold text-green-600">৳{totalPaid.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <p className="text-xs text-muted-foreground uppercase">Due Amount</p>
                                    {dueAmount > 0 && <AlertCircle className="h-3 w-3 text-red-500" />}
                                </div>
                                <p className={`text-sm font-bold ${dueAmount > 0 ? "text-red-500" : "text-green-600"}`}>
                                    ৳{dueAmount.toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status & Logistics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <OrderStatusManager order={order} onUpdate={handleStatusUpdate} />
                        <LogisticsManager order={order} onUpdate={handleStatusUpdate} />
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
                                    <td colSpan={3} className="px-4 py-2 text-right uppercase">Subtotal (Products)</td>
                                    <td className="px-4 py-2 text-right">৳{subtotal.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Payment Tracking Section */}
                    <div className="mt-6 space-y-4 border-t pt-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-primary" /> Payment History
                            </h3>
                            <Button
                                onClick={() => setShowAddPayment(true)}
                                size="sm"
                                variant="outline"
                                className="border-primary/20 hover:bg-primary/5"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Payment
                            </Button>
                        </div>
                        {loadingPayments ? (
                            <div className="text-center py-4 text-muted-foreground animate-pulse">
                                Loading payments...
                            </div>
                        ) : (
                            <PaymentHistory
                                payments={payments}
                                orderTotal={grandTotal}
                            />
                        )}
                    </div>

                    {/* Return History Section */}
                    <ReturnHistorySection orderId={order.id} />
                </div>

                <AddPaymentDialog
                    open={showAddPayment}
                    onOpenChange={setShowAddPayment}
                    orderId={order.id}
                    orderTotal={grandTotal}
                    totalPaid={totalPaid}
                    onSuccess={fetchPayments}
                />
            </DialogContent>
        </Dialog>
    );
}

// Sub-component for Logistics
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { courierApi } from "@/api/endpoint/courier-api";
import { Courier } from "../../../logistics/couriers/components/courier-columns";
import { Input } from "@/components/ui/input";
import { Truck, Loader2 } from "lucide-react";

function LogisticsManager({ order, onUpdate }: { order: Order, onUpdate: () => void }) {
    const [couriers, setCouriers] = useState<Courier[]>([]);
    const [selectedCourier, setSelectedCourier] = useState(order.courier_id || "");
    const [trackingId, setTrackingId] = useState(order.tracking_id || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get(courierApi.GET_ALL).then(res => setCouriers(res.data.data || []));
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put(orderApi.ASSIGN_COURIER(order.id), {
                courierId: selectedCourier,
                trackingId: trackingId
            });
            onUpdate();
            toast.success("Logistics updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update logistics");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/10">
            <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Logistics Assignment</h4>
            </div>

            <div className="space-y-2">
                <div className="flex gap-2">
                    <Select value={selectedCourier} onValueChange={setSelectedCourier}>
                        <SelectTrigger className="w-full h-8 cursor-pointer">
                            <SelectValue placeholder="Select Courier" />
                        </SelectTrigger>
                        <SelectContent>
                            {couriers.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Tracking ID"
                        value={trackingId}
                        onChange={e => setTrackingId(e.target.value)}
                        className="h-8"
                    />
                    <Button size="sm" onClick={handleSave} disabled={loading} className="h-8">
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Sub-component for Return History
import { returnApi } from "@/api/endpoint/return-api";
import { OrderReturn } from "@/types/api";

function ReturnHistorySection({ orderId }: { orderId: string }) {
    const [returns, setReturns] = useState<OrderReturn[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                const response = await api.get(returnApi.GET_BY_ORDER(orderId));
                setReturns(response.data.data || []);
            } catch (error) {
                console.error("Failed to fetch returns:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReturns();
    }, [orderId]);

    if (loading) return <div className="py-4 text-center text-sm text-muted-foreground">Loading refund history...</div>;
    if (returns.length === 0) return null;

    return (
        <div className="mt-6 space-y-4 border-t pt-6">
            <h3 className="font-semibold text-lg text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Return & Refund History
            </h3>
            <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-red-50">
                        <tr>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-left">Reason</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {returns.map((r) => (
                            <tr key={r.id}>
                                <td className="px-4 py-2">{format(new Date(r.date), "dd MMM yyyy")}</td>
                                <td className="px-4 py-2">
                                    <span className="text-xs font-semibold uppercase">{r.type.replace('_', ' ')}</span>
                                </td>
                                <td className="px-4 py-2 text-muted-foreground">{r.reason}</td>
                                <td className="px-4 py-2 text-right font-medium text-red-600">
                                    -৳{parseFloat(r.amount as unknown as string).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
