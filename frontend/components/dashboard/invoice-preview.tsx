"use client";

import { format } from "date-fns";
import { Order, OrderItem } from "@/types/api";
import { useEffect, useState } from "react";
import axios from "axios";
import { settingsApi } from "@/api/endpoint/settings-api";

interface InvoicePreviewProps {
    order: Order;
}

export function InvoicePreview({ order }: InvoicePreviewProps) {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        axios.get(settingsApi.GET).then((res) => {
            setSettings(res.data.Data || res.data.data);
        });
    }, []);

    if (!order) return null;

    return (
        <div className="bg-white text-zinc-900 p-8 max-w-[800px] mx-auto id-printable-invoice">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-1">
                        {settings?.shop_name || "IMS STORE"}
                    </h1>
                    <div className="text-sm space-y-0.5 text-zinc-600">
                        <p className="whitespace-pre-line">{settings?.shop_address || "123 Business Avenue, Suite 100"}</p>
                        <p>Phone: {settings?.shop_phone || "+1 (555) 000-0000"}</p>
                        <p>Email: {settings?.shop_email || "billing@ims-store.com"}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-5xl font-black text-zinc-200 uppercase mb-2">Invoice</h2>
                    <div className="space-y-1">
                        <p className="font-bold flex justify-end gap-4">
                            <span className="text-zinc-400">Invoice No:</span>
                            <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                        </p>
                        <p className="font-bold flex justify-end gap-4">
                            <span className="text-zinc-400">Date:</span>
                            <span>{format(new Date(order.date), "dd MMM yyyy")}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 border-b border-zinc-100 pb-1">
                        Bill To
                    </h3>
                    <p className="text-xl font-bold">{order.customer_name || "Walk-in Customer"}</p>
                    <div className="text-zinc-600 mt-2">
                        <p>{order.customer_phone || "No phone provided"}</p>
                        {/* If you have customer address, add it here */}
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 border-b border-zinc-100 pb-1 flex justify-end">
                        Status
                    </h3>
                    <div className="inline-flex items-center bg-zinc-900 text-white px-3 py-1 text-sm font-bold uppercase tracking-tighter italic">
                        {order.status}
                    </div>
                    <div className="mt-4 text-sm text-zinc-600">
                        <p>Platform: <span className="font-bold text-zinc-900">{order.platform || "Direct"}</span></p>
                        <p>Payment: <span className="font-bold text-zinc-900 capitalize">{order.payment_status || "Pending"}</span></p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <table className="w-full mb-12 border-collapse">
                <thead className="bg-zinc-900 text-white">
                    <tr>
                        <th className="text-left py-3 px-4 font-black uppercase text-xs tracking-widest italic">Item Description</th>
                        <th className="text-center py-3 px-4 font-black uppercase text-xs tracking-widest italic">Qty</th>
                        <th className="text-right py-3 px-4 font-black uppercase text-xs tracking-widest italic">Rate</th>
                        <th className="text-right py-3 px-4 font-black uppercase text-xs tracking-widest italic">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 border-b-2 border-zinc-900">
                    {order.items?.map((item, index) => (
                        <tr key={index}>
                            <td className="py-4 px-4 font-bold">{item.product_name}</td>
                            <td className="py-4 px-4 text-center font-medium">{item.quantity}</td>
                            <td className="py-4 px-4 text-right font-medium">৳{Number(item.price).toLocaleString()}</td>
                            <td className="py-4 px-4 text-right font-bold">৳{Number(item.total).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end gap-x-12">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-zinc-500 font-bold">
                        <span>Subtotal</span>
                        <span>৳{Number(order.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500 font-bold">
                        <span>Shipping</span>
                        <span>৳0.00</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-900 text-white p-4 italic">
                        <span className="font-black uppercase tracking-tighter text-xl">Total</span>
                        <span className="font-black text-2xl tracking-tighter">৳{Number(order.total_amount).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-zinc-100 text-center">
                <p className="text-zinc-600 text-sm font-medium italic">
                    {settings?.footer_text || "Thank you for your business!"}
                </p>
            </div>

            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .id-printable-invoice, .id-printable-invoice * {
            visibility: visible;
          }
          .id-printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
