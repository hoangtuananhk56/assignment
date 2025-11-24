import { Product, Role, User, Order } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', firstName: 'Sarah', lastName: 'Connor', email: 'sarah@example.com', role: Role.ADMIN, status: 'Active', avatar: 'https://picsum.photos/100/100?random=1' },
  { id: '2', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: Role.CUSTOMER, status: 'Active', avatar: 'https://picsum.photos/100/100?random=2' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: '101', name: 'Clear Aligner Pro', price: 1200, category: 'Dental', stock: 50, image: 'https://picsum.photos/300/200?random=10', description: 'Professional grade clear aligners.' },
  { id: '102', name: 'Whitening Kit', price: 45, category: 'Cosmetic', stock: 200, image: 'https://picsum.photos/300/200?random=11', description: 'Advanced home whitening system.' },
  { id: '103', name: 'Retainer Case', price: 15, category: 'Accessories', stock: 500, image: 'https://picsum.photos/300/200?random=12', description: 'Durable case for your aligners.' },
  { id: '104', name: 'Electric Toothbrush', price: 89, category: 'Dental', stock: 30, image: 'https://picsum.photos/300/200?random=13', description: 'Sonic cleaning technology.' },
  { id: '105', name: 'Dental Floss Picks', price: 5, category: 'Consumables', stock: 1000, image: 'https://picsum.photos/300/200?random=14', description: 'Eco-friendly floss picks.' },
];

export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-001', userId: '2', items: [], total: 1245, status: 'Delivered', date: '2023-10-15' },
  { id: 'ORD-002', userId: '2', items: [], total: 45, status: 'Processing', date: '2023-10-20' },
];
