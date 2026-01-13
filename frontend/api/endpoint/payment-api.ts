const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const paymentApi = {
    CREATE: `${baseUrl}/payments`,
    GET_BY_ORDER: (orderId: string) => `${baseUrl}/payments/order/${orderId}`,
};
