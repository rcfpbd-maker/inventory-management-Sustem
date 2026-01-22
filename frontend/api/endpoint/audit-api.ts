const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const auditApi = {
    GET_ALL: `${baseUrl}/audit-logs`,
};
