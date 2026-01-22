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
import { Loader2, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

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

    // Derive status color
    const getStatusColor = (s: string) => {
        switch (s?.toUpperCase()) {
            case "PENDING": return "secondary";
            case "CONFIRMED": return "default";
            case "PROCESSING": return "default";
            case "SHIPPED": return "secondary";
            case "DELIVERED": return "default";
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
            await api.put(
                `/orders/${order.id}/status`,
                { status }
            );
            toast.success("Order status updated successfully");
            if (onUpdate) onUpdate();
        } catch (error: any) {
            console.error("Failed to update status:", error);
            toast.error(error.response?.data?.message || "Failed to update order status");
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
                        Current: <Badge variant={getStatusColor(order.status || "PENDING") as any}>{order.status || "PENDING"}</Badge>
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
