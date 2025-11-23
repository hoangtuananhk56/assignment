import api from './axiosClient';

// Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    roleName: string;
    password: string;
}

export interface AuthResponse {
    data: {
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            roleName: string;
            role?: {
                id: string;
                name: string;
            };
            permissions?: Array<{
                resource: string;
                action: string;
            }>;
        }
        statusCode: number
    };
}

// Helper function to decode JWT token
const decodeToken = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
};

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
};

// Auth API Service
const authService = {
    // Login
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);

            console.log('Login response:', response); // Debug log

            // Store tokens and user data
            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    },

    // Register
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/register', data);

            console.log('Register response:', response); // Debug log

            // Store tokens and user data
            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Registration failed');
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    },

    // Get current user from storage
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('access_token');
        if (!token) return false;

        // Check if token is expired
        if (isTokenExpired(token)) {
            // Token expired, clear storage
            authService.logout();
            return false;
        }

        return true;
    },
};

export default authService;
