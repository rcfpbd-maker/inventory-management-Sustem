"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Store, MapPin, Phone, Mail, Globe, Save, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";

const settingsSchema = z.object({
    shop_name: z.string().min(2, "Shop name must be at least 2 characters"),
    shop_address: z.string().min(5, "Address must be at least 5 characters"),
    shop_phone: z.string().min(10, "Phone number must be at least 10 characters"),
    shop_email: z.string().email("Invalid email address"),
    currency_symbol: z.string().min(1, "Currency symbol is required"),
    footer_text: z.string().optional(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
    const { data: settingsData, isLoading } = useSettings();
    const updateSettings = useUpdateSettings();

    const form = useForm<SettingsValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            shop_name: "",
            shop_address: "",
            shop_phone: "",
            shop_email: "",
            currency_symbol: "৳",
            footer_text: "",
        },
    });

    useEffect(() => {
        if (settingsData?.Data) {
            const settings = settingsData.Data;
            form.reset({
                shop_name: settings.shop_name || "",
                shop_address: settings.shop_address || "",
                shop_phone: settings.shop_phone || "",
                shop_email: settings.shop_email || "",
                currency_symbol: settings.currency_symbol || "৳",
                footer_text: settings.footer_text || "",
            });
        }
    }, [settingsData, form]);

    const onSubmit = (values: SettingsValues) => {
        updateSettings.mutate(values);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                <p className="text-muted-foreground">
                    Manage your shop information and application preferences.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5 text-primary" />
                                Shop Information
                            </CardTitle>
                            <CardDescription>
                                This information will appear on your invoices and reports.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="shop_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shop Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="My Awesome Store" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="currency_symbol"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency Symbol</FormLabel>
                                            <FormControl>
                                                <Input placeholder="৳" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="shop_address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shop Address</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="123 Shopping Street, City"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="shop_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9" placeholder="+8801..." {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="shop_email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9" placeholder="contact@shop.com" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="footer_text"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Invoice Footer Text</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Thank you for shopping with us!" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This text will appear at the bottom of printed invoices.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={updateSettings.isPending}>
                            {updateSettings.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Settings
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
