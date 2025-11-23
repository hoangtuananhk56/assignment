import api from './axiosClient';

// Types
export interface Category {
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
}

export interface UpdateCategoryRequest {
    name?: string;
    description?: string;
}

// Category API Service
const categoryService = {
    // CREATE - Create new category
    create: async (data: CreateCategoryRequest): Promise<Category> => {
        try {
            const response = await api.post<Category>('/categories', data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create category');
        }
    },

    // READ - Get all categories
    getAll: async (page: number = 1, limit: number = 100): Promise<Category[]> => {
        try {
            const response = await api.get<Category[]>(`/categories?page=${page}&limit=${limit}`);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch categories');
        }
    },

    // READ - Get category by ID
    getById: async (id: string): Promise<Category> => {
        try {
            const response = await api.get<Category>(`/categories/${id}`);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch category');
        }
    },

    // UPDATE - Update category
    update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
        try {
            const response = await api.patch<Category>(`/categories/${id}`, data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update category');
        }
    },

    // DELETE - Delete category
    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`/categories/${id}`);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete category');
        }
    },
};

export default categoryService;
