const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const settingsApi = {
    GET: `${baseUrl}/settings`,
    UPDATE: `${baseUrl}/settings`,
};
