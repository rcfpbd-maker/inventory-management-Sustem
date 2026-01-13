const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const productApi = {
    GET_ALL: `${baseUrl}/products`,
    GET_BY_ID: (id: string) => `${baseUrl}/products/${id}`,
    CREATE: `${baseUrl}/products`,
    UPDATE: (id: string) => `${baseUrl}/products/${id}`,
    DELETE: (id: string) => `${baseUrl}/products/${id}`,
};
