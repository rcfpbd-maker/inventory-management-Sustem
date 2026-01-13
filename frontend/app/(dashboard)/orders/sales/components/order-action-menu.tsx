"use client";

import { Eye, MoreHorizontal, Printer, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Order } from "@/types/api";

interface OrderActionMenuProps {
    order: Order;
    onView: (order: Order) => void;
    onPrint: (order: Order) => void;
    onReturn?: (order: Order) => void;
}

export function OrderActionMenu({
    order,
    onView,
    onPrint,
    onReturn,
}: OrderActionMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onView(order)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPrint(order)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                </DropdownMenuItem>
                {onReturn && order.status !== 'RETURNED' && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onReturn(order)} className="text-yellow-600 focus:text-yellow-600">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Record Return
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
