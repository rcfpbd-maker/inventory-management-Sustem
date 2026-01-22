import axiosInstance from "@/lib/axios";
import { auditApi } from "./endpoint/audit-api";
import { AuditLog, ApiResponse } from "../types/api";

export interface AuditFilters {
  userId?: string;
  category?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const auditLogsApi = {
  getAll: async (filters?: AuditFilters): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.action) params.append("action", filters.action);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${auditApi.GET_ALL}?${queryString}` : auditApi.GET_ALL;
    const response = await axiosInstance.get(url);
    return response.data;
  },
};
