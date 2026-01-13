"use client";

import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../../../../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Payment } from "../../../../../types/api";

interface PaymentHistoryProps {
    payments: Payment[];
    orderTotal: number;
}

export function PaymentHistory({ payments, orderTotal }: PaymentHistoryProps) {
    const totalPaid = payments.reduce(
        (sum, payment) => sum + parseFloat(payment.amount.toString()),
        0
    );
    const remainingAmount = orderTotal - totalPaid;

    const getPaymentStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
            COMPLETED: "default",
            PENDING: "secondary",
            FAILED: "destructive",
        };
        return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                    Total Paid: ৳{totalPaid.toLocaleString()} | Remaining: ৳
                    {remainingAmount.toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {payments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No payments recorded yet
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Channel</TableHead>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        {format(new Date(payment.date), "dd MMM yyyy")}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {payment.paymentMethod}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {payment.paymentChannel || "-"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-xs">
                                        {payment.transactionId || "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ৳{parseFloat(payment.amount.toString()).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
