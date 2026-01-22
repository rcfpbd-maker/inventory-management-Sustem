"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Order, Payment } from "@/types/api";
import { format } from "date-fns";
import { Printer, Plus, Info, Receipt, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { paymentApi } from "@/api/endpoint/payment-api";
import { AddPaymentDialog } from "./add-payment-dialog";
import { PaymentHistory } from "./payment-history";
import { OrderStatusManager } from "./order-status-manager";
import { useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/api/endpoint/order-api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InvoicePreview } from "@/components/dashboard/invoice-preview";

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
        queryClient.invalidateQueries({ queryKey: [orderApi.GET_ALL] });
        queryClient.invalidateQueries({ queryKey: ["/products"] }); // Refresh stock in background
        if (order) {
            queryClient.invalidateQueries({ queryKey: [orderApi.GET_BY_ID(order.id)] });
        }
    };

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
            setPayments(response.data.Data || response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoadingPayments(false);
        }
    };

    if (!order) return null;

    const totalPaid = payments.reduce(
        (sum, payment) => sum + parseFloat(payment.amount.toString()),
        0
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-0 flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-2xl font-bold">Order Management</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            Reference: #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 border-b flex items-center justify-between">
                        <TabsList className="bg-transparent gap-6 h-12">
                            <TabsTrigger
                                value="details"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 gap-2"
                            >
                                <Info className="h-4 w-4" /> Details
                            </TabsTrigger>
                            <TabsTrigger
                                value="invoice"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 gap-2"
                            >
                                <Receipt className="h-4 w-4" /> Invoice
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            <Button onClick={handlePrint} variant="outline" size="sm">
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <TabsContent value="details" className="mt-0 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
                                            Customer Information
                                        </h3>
                                        <div className="bg-muted/30 p-4 rounded-lg">
                                            <p className="font-bold text-lg text-zinc-900 dark:text-zinc-100 italic">
                                                {order.customer_name || "Walk-in Customer"}
                                            </p>
                                            {order.customer_phone && (
                                                <p className="text-sm font-medium mt-1">Phone: {order.customer_phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <OrderStatusManager order={order} onUpdate={handleStatusUpdate} />
                                        <LogisticsManager order={order} onUpdate={handleStatusUpdate} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
                                            Order Summary
                                        </h3>
                                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Date:</span>
                                                <span className="font-medium text-right">
                                                    {order.date ? format(new Date(order.date), "PPP") : "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Channel:</span>
                                                <span className="font-medium capitalize">{order.platform || "Direct"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm pt-2 border-t">
                                                <span className="font-bold">Total Amount:</span>
                                                <span className="font-bold text-lg text-primary">
                                                    ৳{parseFloat(order.total_amount as string).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div className="border rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
                                        <table className="w-full text-xs">
                                            <thead className="bg-muted/50 border-b">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-bold uppercase tracking-wider italic">Product</th>
                                                    <th className="px-3 py-2 text-right font-bold uppercase tracking-wider italic">Qty</th>
                                                    <th className="px-3 py-2 text-right font-bold uppercase tracking-wider italic">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {order.items?.map((item: any, index: number) => (
                                                    <tr key={index}>
                                                        <td className="px-3 py-2 font-medium">{item.product_name || "Unknown Product"}</td>
                                                        <td className="px-3 py-2 text-right font-bold">{item.quantity}</td>
                                                        <td className="px-3 py-2 text-right">৳{parseFloat(item.price as string).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="space-y-4 border-t pt-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-xl tracking-tight italic">Financial Tracking</h3>
                                    <Button
                                        onClick={() => setShowAddPayment(true)}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" /> Record Payment
                                    </Button>
                                </div>
                                {loadingPayments ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <PaymentHistory
                                        payments={payments}
                                        orderTotal={parseFloat(order.total_amount.toString())}
                                    />
                                )}
                            </div>

                            {/* Returns Section */}
                            <ReturnHistorySection orderId={order.id} />
                        </TabsContent>

                        <TabsContent value="invoice" className="mt-0">
                            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border-dashed border-2">
                                <InvoicePreview order={order} />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

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
import { Truck } from "lucide-react";

function LogisticsManager({ order, onUpdate }: { order: Order, onUpdate: () => void }) {
    const [couriers, setCouriers] = useState<Courier[]>([]);
    const [selectedCourier, setSelectedCourier] = useState(order.courier_id || "");
    const [trackingId, setTrackingId] = useState(order.tracking_id || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch couriers
        axios.get(courierApi.GET_ALL).then(res => setCouriers(res.data.data || []));
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.put(orderApi.ASSIGN_COURIER(order.id), {
                courierId: selectedCourier,
                trackingId: trackingId
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            onUpdate();
        } catch (error) {
            console.error(error);
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

// Sub-component for Return History to keep main component clean
import { returnApi } from "@/api/endpoint/return-api";
import { OrderReturn } from "@/types/api";

function ReturnHistorySection({ orderId }: { orderId: string }) {
    const [returns, setReturns] = useState<OrderReturn[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                const response = await axios.get(returnApi.GET_BY_ORDER(orderId), {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                setReturns(response.data.data || []);
            } catch (error) {
                console.error("Failed to fetch returns:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReturns();
    }, [orderId]);

    if (loading) return <div className="py-4 text-center text-sm text-muted-foreground">Loading specific refund history...</div>;
    if (returns.length === 0) return null;

    return (
        <div className="mt-6 space-y-4 border-t pt-6">
            <h3 className="font-semibold text-lg text-red-600">Return & Refund History</h3>
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
