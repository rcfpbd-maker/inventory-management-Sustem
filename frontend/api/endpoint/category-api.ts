const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const categoryApi = {
    GET_ALL: `${baseUrl}/categories`,
    GET_BY_ID: (id: string) => `${baseUrl}/categories/${id}`,
    CREATE: `${baseUrl}/categories`,
    UPDATE: (id: string) => `${baseUrl}/categories/${id}`,
    DELETE: (id: string) => `${baseUrl}/categories/${id}`,
};
