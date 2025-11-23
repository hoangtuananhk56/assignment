import api from './axiosClient';

// Types
export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    product?: {
        id: string;
        name: string;
        description?: string | null;
        price: number;
    };
}

export interface Order {
    id: string;
    userId: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    items?: OrderItem[];
    user?: {
        id: string;
        email: string;
        firstName?: string | null;
        lastName?: string | null;
    };
}

export interface CreateOrderRequest {
    items: {
        productId: string;
        quantity: number;
    }[];
}

export interface UpdateOrderStatusRequest {
    status: string;
}

// Order API Service
const orderService = {
    // CREATE - Create order from cart
    createFromCart: async (): Promise<Order> => {
        try {
            const response = await api.post<Order>('/orders', {});
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create order');
        }
    },

    // CREATE - Create order with items in request body
    create: async (data: CreateOrderRequest): Promise<Order> => {
        try {
            const response = await api.post<Order>('/orders/direct', data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create order');
        }
    },

    // READ - Get all orders
    getAll: async (page: number = 1, limit: number = 10): Promise<Order[]> => {
        try {
            const response = await api.get<Order[]>(`/orders?page=${page}&limit=${limit}`);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch orders');
        }
    },

    // READ - Get my orders
    getMyOrders: async (page: number = 1, limit: number = 10): Promise<Order[]> => {
        try {
            const response = await api.get<Order[]>(`/orders/my-orders?page=${page}&limit=${limit}`);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch your orders');
        }
    },

    // READ - Get order by ID
    getById: async (id: string): Promise<Order> => {
        try {
            const response = await api.get<Order>(`/orders/${id}`);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch order');
        }
    },

    // UPDATE - Update order status
    updateStatus: async (id: string, data: UpdateOrderStatusRequest): Promise<Order> => {
        try {
            const response = await api.patch<Order>(`/orders/${id}`, data);
            return response;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update order');
        }
    },

    // DELETE - Cancel order
    cancel: async (id: string): Promise<void> => {
        try {
            await api.post(`/orders/${id}/cancel`, {});
        } catch (error: any) {
            throw new Error(error.message || 'Failed to cancel order');
        }
    },

    // DELETE - Delete order
    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`/orders/${id}`);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete order');
        }
    },
};

export default orderService;
