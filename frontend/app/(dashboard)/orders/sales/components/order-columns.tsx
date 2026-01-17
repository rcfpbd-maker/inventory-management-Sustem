"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/types/api";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderActionMenu } from "./order-action-menu";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Facebook, Globe, MessageCircle, Phone, Smartphone } from "lucide-react";

const getPlatformIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
        case "facebook": return <Facebook className="h-4 w-4 text-blue-600" />;
        case "website": return <Globe className="h-4 w-4 text-green-600" />;
        case "whatsapp": return <MessageCircle className="h-4 w-4 text-green-500" />;
        case "phone": return <Phone className="h-4 w-4 text-gray-600" />;
        default: return <Smartphone className="h-4 w-4 text-gray-400" />;
    }
};

const getStatusColor = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toUpperCase()) {
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

const getPaymentStatusColor = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toUpperCase()) {
        case "PAID": return "default";
        case "PARTIAL": return "secondary";
        case "UNPAID": return "destructive";
        case "DUE": return "destructive";
        default: return "secondary";
    }
};

export const columns = (
    onView: (order: Order) => void,
    onPrint: (order: Order) => void,
    onReturn?: (order: Order) => void
): ColumnDef<any>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => {
                try {
                    return format(new Date(row.getValue("date")), "dd MMM yy");
                } catch {
                    return row.getValue("date");
                }
            },
        },
        {
            accessorKey: "platform",
            header: "Platform",
            cell: ({ row }) => (
                <div className="flex items-center gap-2" title={row.getValue("platform")}>
                    {getPlatformIcon(row.getValue("platform"))}
                    <span className="hidden xl:inline">{row.getValue("platform")}</span>
                </div>
            ),
        },
        {
            accessorKey: "customer_name",
            header: "Customer",
            cell: ({ row }) => row.getValue("customer_name") || <span className="text-muted-foreground italic">Walk-in</span>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string || "PENDING";
                return <Badge variant={getStatusColor(status)}>{status}</Badge>;
            },
        },
        {
            accessorKey: "payment_status",
            header: "Payment",
            cell: ({ row }) => {
                const status = row.getValue("payment_status") as string || "UNPAID";
                return <Badge variant={getPaymentStatusColor(status)}>{status}</Badge>;
            },
        },
        {
            accessorKey: "total_amount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("total_amount"));
                const formatted = new Intl.NumberFormat("en-BD", {
                    style: "currency",
                    currency: "BDT",
                    minimumFractionDigits: 0,
                }).format(amount);
                return <div className="font-medium">{formatted}</div>;
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <OrderActionMenu
                    order={row.original}
                    onView={onView}
                    onPrint={onPrint}
                    onReturn={onReturn}
                />
            ),
        },
    ];
