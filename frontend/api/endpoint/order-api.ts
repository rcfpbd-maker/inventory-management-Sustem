const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const orderApi = {
    GET_ALL: `${baseUrl}/orders`,
    GET_BY_ID: (id: string) => `${baseUrl}/orders/${id}`,
    CREATE: `${baseUrl}/orders`,
    UPDATE: (id: string) => `${baseUrl}/orders/${id}`,
    UPDATE_STATUS: (id: string) => `${baseUrl}/orders/${id}/status`,
    ASSIGN_COURIER: (id: string) => `${baseUrl}/orders/${id}/courier`,
};
