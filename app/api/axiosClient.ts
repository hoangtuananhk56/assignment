import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base URL for API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const axiosClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors and unwrap data
axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Server wraps responses in {statusCode, data} format
        // Extract the inner data property if it exists
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            return response.data.data;
        }
        return response.data;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Clear tokens and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return Promise.reject(new Error('Session expired. Please login again.'));
        }

        // Handle common errors
        const errorMessage = handleError(error);
        return Promise.reject(new Error(errorMessage));
    }
);

// Error handler
const handleError = (error: AxiosError): string => {
    if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;

        switch (status) {
            case 400:
                return (data as any)?.message || 'Bad request. Please check your input.';
            case 401:
                return 'Unauthorized. Please login again.';
            case 403:
                return 'Forbidden. You do not have permission to access this resource.';
            case 404:
                return 'Resource not found.';
            case 409:
                return (data as any)?.message || 'Conflict. Resource already exists.';
            case 422:
                return (data as any)?.message || 'Validation error. Please check your input.';
            case 500:
                return 'Internal server error. Please try again later.';
            case 503:
                return 'Service unavailable. Please try again later.';
            default:
                return (data as any)?.message || 'An error occurred. Please try again.';
        }
    } else if (error.request) {
        // Request made but no response
        return 'Network error. Please check your internet connection.';
    } else {
        // Error setting up request
        return error.message || 'An unexpected error occurred.';
    }
};

// Generic API methods
const api = {
    // CREATE
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        return axiosClient.post(url, data, config);
    },

    // READ
    get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        return axiosClient.get(url, config);
    },

    // UPDATE (full update)
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        return axiosClient.put(url, data, config);
    },

    // UPDATE (partial update)
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        return axiosClient.patch(url, data, config);
    },

    // DELETE
    delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        return axiosClient.delete(url, config);
    },
};

export default api;
export { axiosClient };