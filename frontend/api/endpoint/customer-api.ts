const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const customerApi = {
    GET_ALL: `${baseUrl}/customers`,
    GET_BY_ID: (id: string) => `${baseUrl}/customers/${id}`,
    CREATE: `${baseUrl}/customers`,
    UPDATE: (id: string) => `${baseUrl}/customers/${id}`,
    DELETE: (id: string) => `${baseUrl}/customers/${id}`,
    GET_ORDERS: (id: string) => `${baseUrl}/customers/${id}/orders`,
};
