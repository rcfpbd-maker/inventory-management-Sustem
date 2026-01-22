"use client";

import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/api/endpoint/audit-api";
import { auditLogsApi, AuditFilters } from "@/api/audit";

export function useAuditLogs(filters?: AuditFilters) {
    return useQuery({
        queryKey: [auditApi.GET_ALL, filters],
        queryFn: () => auditLogsApi.getAll(filters),
    });
}
