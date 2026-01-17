const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const courierApi = {
    GET_ALL: `${baseUrl}/couriers`,
    CREATE: `${baseUrl}/couriers`,
    UPDATE: (id: string) => `${baseUrl}/couriers/${id}`,
    DELETE: (id: string) => `${baseUrl}/couriers/${id}`,
};
