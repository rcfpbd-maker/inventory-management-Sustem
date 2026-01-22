"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { settingsApi } from "@/api/endpoint/settings-api";
import { toast } from "sonner";

export function useSettings() {
    return useQuery({
        queryKey: [settingsApi.GET],
        queryFn: async () => {
            const response = await axiosInstance.get(settingsApi.GET);
            return response.data;
        },
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const response = await axiosInstance.put(settingsApi.UPDATE, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [settingsApi.GET] });
            toast.success("Settings updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update settings");
        },
    });
}
