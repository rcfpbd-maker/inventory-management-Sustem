const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const returnApi = {
    GET_ALL: `${baseUrl}/returns`,
    GET_BY_ORDER: (orderId: string) => `${baseUrl}/returns/order/${orderId}`,
    CREATE: `${baseUrl}/returns`,
};
