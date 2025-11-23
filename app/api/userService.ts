import api from './axiosClient';

// Types
export interface User {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    roleName?: string | null;
    roleId: string;
    role?: {
        id: string;
        name: string;
        description?: string | null;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    roleName?: string;
    roleId?: string;
}

export interface UpdateUserRequest {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    roleName?: string;
    roleId?: string;
}

// User API Service
const userService = {
    // CREATE - Create new user (Admin only)
    create: async (data: CreateUserRequest): Promise<User> => {
        try {
            const response = await api.post<User>('/users', data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create user');
        }
    },

    // READ - Get all users (Admin only)
    getAll: async (page: number = 1, limit: number = 10): Promise<User[]> => {
        try {
            const response = await api.get<User[]>(`/users?page=${page}&limit=${limit}`);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch users');
        }
    },

    // READ - Get user by ID (Admin only)
    getById: async (id: string): Promise<User> => {
        try {
            const response = await api.get<User>(`/users/${id}`);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch user');
        }
    },

    // READ - Get current user profile
    getMe: async (): Promise<User> => {
        try {
            const response = await api.get<User>('/users/me');
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch profile');
        }
    },

    // UPDATE - Update user
    update: async (id: string, data: UpdateUserRequest): Promise<User> => {
        try {
            const response = await api.patch<User>(`/users/${id}`, data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update user');
        }
    },

    // DELETE - Delete user (Admin only)
    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`/users/${id}`);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete user');
        }
    },
};

export default userService;
