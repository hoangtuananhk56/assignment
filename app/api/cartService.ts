import api from './axiosClient';

// Types
export interface CartItem {
    id: string;
    userId: string;
    productId: string;
    quantity: number;
    product?: {
        id: string;
        name: string;
        description?: string | null;
        price: number;
        stockQuantity: number;
        category?: {
            id: string;
            name: string;
        };
    };
}

export interface Cart {
    items: CartItem[];
}

export interface AddToCartRequest {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

// Cart API Service
const cartService = {
    // READ - Get current user's cart
    getCart: async (): Promise<Cart> => {
        try {
            const response = await api.get<Cart>('/cart');
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch cart');
        }
    },

    // CREATE - Add item to cart
    addItem: async (data: AddToCartRequest): Promise<CartItem> => {
        try {
            const response = await api.post<CartItem>('/cart/items', data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to add item to cart');
        }
    },

    // UPDATE - Update cart item quantity
    updateItem: async (productId: string, data: UpdateCartItemRequest): Promise<CartItem> => {
        try {
            const response = await api.patch<CartItem>(`/cart/items/${productId}`, data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update cart item');
        }
    },

    // DELETE - Remove item from cart
    removeItem: async (productId: string): Promise<void> => {
        try {
            await api.delete(`/cart/items/${productId}`);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to remove item from cart');
        }
    },

    // DELETE - Clear entire cart
    clearCart: async (): Promise<void> => {
        try {
            await api.delete('/cart');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to clear cart');
        }
    },
};

export default cartService;
