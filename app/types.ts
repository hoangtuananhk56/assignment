export enum Role {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  USER = 'User'
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  avatar?: string;
  status: 'Active' | 'Inactive';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  date: string;
}

export type ViewState = 
  | 'LOGIN' 
  | 'REGISTER' 
  | 'DASHBOARD' 
  | 'USERS' 
  | 'ROLES' 
  | 'PRODUCTS' 
  | 'SHOP' 
  | 'CART' 
  | 'ORDERS';
