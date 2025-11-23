import api from './axiosClient';

// Types
export interface Product {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    stockQuantity: number;
    categoryId: string;
    category?: {
        id: string;
        name: string;
        description?: string | null;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductRequest {
    name: string;
    description?: string;
    price: number;
    stockQuantity: number;
    categoryId: string;
}

export interface UpdateProductRequest {
    name?: string;
    description?: string;
    price?: number;
    stockQuantity?: number;
    categoryId?: string;
}

// Product API Service
const productService = {
    // CREATE - Create new product
    create: async (data: CreateProductRequest): Promise<Product> => {
        try {
            const response = await api.post<Product>('/products', data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create product');
        }
    },

    // READ - Get all products
    getAll: async (): Promise<Product[]> => {
        try {
            const response = await api.get<Product[]>('/products');
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch products');
        }
    },

    // READ - Get product by ID
    getById: async (id: string): Promise<Product> => {
        try {
            const response = await api.get<Product>(`/products/${id}`);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch product');
        }
    },

    // UPDATE - Update product
    update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
        try {
            const response = await api.patch<Product>(`/products/${id}`, data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update product');
        }
    },

    // DELETE - Delete product
    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`/products/${id}`);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete product');
        }
    },
};

export default productService;
