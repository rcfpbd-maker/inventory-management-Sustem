const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const reportApi = {
    DAILY_SALES: (date: string) => `${baseUrl}/reports/daily-sales?date=${date}`,
    USER_PERFORMANCE: (period: string, userId?: string) =>
        `${baseUrl}/reports/user-performance?period=${period}${userId ? `&userId=${userId}` : ''}`,
    PROFIT_LOSS: (start: string, end: string) => `${baseUrl}/reports/profit-loss?startDate=${start}&endDate=${end}`,
    DAILY_LEDGER: (date: string) => `${baseUrl}/reports/daily-ledger?date=${date}`,
    ORDER_PROFIT: `${baseUrl}/reports/profit/orders`,
    GET_PLATFORM_SALES: `${baseUrl}/reports/platform-sales`,
    GET_DUE_LIST: `${baseUrl}/reports/due-list`,
};
