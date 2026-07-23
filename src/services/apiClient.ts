export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchApi = async (endpoint: string, options?: RequestInit) => {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetch(url, options);
};
