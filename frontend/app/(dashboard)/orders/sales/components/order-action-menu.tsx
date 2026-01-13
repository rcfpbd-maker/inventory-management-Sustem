"use client";

import { Eye, MoreHorizontal, Printer } from "lucide-react";
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
}

export function OrderActionMenu({
    order,
    onView,
    onPrint,
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
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
