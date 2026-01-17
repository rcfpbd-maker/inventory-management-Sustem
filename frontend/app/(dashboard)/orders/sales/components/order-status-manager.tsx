"use client";

import { useState } from "react";
import { Order } from "@/types/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { usePostData } from "@/hooks/useFetchData"; // Assuming usePutData is not available or we use usePostData with method override if supported, or axios
import axios from "axios";
import { orderApi } from "@/api/endpoint/order-api";
import { toast } from "sonner"; // Assuming sonner is used, or use toast from ui/use-toast

interface OrderStatusManagerProps {
    order: Order;
    onUpdate?: () => void;
}

const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
];

export function OrderStatusManager({ order, onUpdate }: OrderStatusManagerProps) {
    const [status, setStatus] = useState(order.status || "PENDING");
    const [loading, setLoading] = useState(false);

    // Derive status color (similar to columns)
    const getStatusColor = (s: string) => {
        switch (s?.toUpperCase()) {
            case "PENDING": return "secondary";
            case "CONFIRMED": return "default"; // or blue
            case "PROCESSING": return "default";
            case "SHIPPED": return "secondary";
            case "DELIVERED": return "default"; // green
            case "CANCELLED": return "destructive";
            case "RETURNED": return "destructive";
            default: return "secondary";
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setStatus(newStatus);
    };

    const handleUpdate = async () => {
        if (status === order.status) return;

        setLoading(true);
        try {
            // Manually using axios for PUT if custom hook doesn't support it easily or for direct control
            // The backend endpoint is PUT /api/orders/:id/status
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            toast.success("Order status updated successfully");
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Failed to update order status");
            setStatus(order.status || "PENDING"); // Revert on failure
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
            <div className="flex items-center gap-4">
                <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Order Status</p>
                    <p className="text-sm text-muted-foreground">
                        Current: <Badge variant={getStatusColor(order.status || "PENDING")}>{order.status || "PENDING"}</Badge>
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    onClick={handleUpdate}
                    disabled={loading || status === order.status}
                    size="sm"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    <span className="ml-2 sr-only lg:not-sr-only">Update</span>
                </Button>
            </div>
        </div>
    );
}
