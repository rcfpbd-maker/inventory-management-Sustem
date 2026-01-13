const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const expenseApi = {
    GET_ALL: `${baseUrl}/expenses`,
    CREATE: `${baseUrl}/expenses`,
    DELETE: (id: string) => `${baseUrl}/expenses/${id}`,
};
