const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const incomeApi = {
    GET_ALL: `${baseUrl}/income`,
    CREATE: `${baseUrl}/income`,
    DELETE: (id: string) => `${baseUrl}/income/${id}`,
};
