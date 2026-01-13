const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const supplierApi = {
    GET_ALL: `${baseUrl}/suppliers`,
    GET_BY_ID: (id: string) => `${baseUrl}/suppliers/${id}`,
    CREATE: `${baseUrl}/suppliers`,
    UPDATE: (id: string) => `${baseUrl}/suppliers/${id}`,
    DELETE: (id: string) => `${baseUrl}/suppliers/${id}`,
    GET_PURCHASES: (id: string) => `${baseUrl}/suppliers/${id}/purchases`,
};
