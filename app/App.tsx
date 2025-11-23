import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/screens/Auth';
import { DashboardLayout } from './components/screens/Dashboard';
import {
  UserManagement, RoleManagement, Shop, Cart, Orders, DashboardOverview
} from './components/screens/Features';
import { ProductManagement } from './components/screens/Features_ProductManagement';
import { ViewState, CartItem, Product, Order, User } from './types';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_USERS } from './constants';
import authService from './api/authService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('LOGIN');
  const [isLoading, setIsLoading] = useState(true);

  // State Management
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        setCurrentView('DASHBOARD');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentView('LOGIN');
    setCart([]);
  };

  // --- User Handlers ---
  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      avatar: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`
    };
    setUsers([newUser, ...users]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  // --- Cart & Shop Handlers ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct = {
      ...productData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setProducts([newProduct, ...products]);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 1.1;

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: '2', // Simulating the current user
      items: [...cart],
      total: totalAmount,
      status: 'Processing',
      date: new Date().toISOString().split('T')[0]
    };

    // Add new order to history
    setOrders([newOrder, ...orders]);

    // Clear cart
    setCart([]);

    // Navigate to orders page to show success/history
    setCurrentView('ORDERS');
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'USERS':
        return <UserManagement />;
      case 'ROLES': return <RoleManagement users={users} />;
      case 'PRODUCTS': return <ProductManagement />;
      case 'SHOP': return <Shop products={products} onAddToCart={addToCart} />;
      case 'CART':
        return (
          <Cart
            items={cart}
            onCheckout={handleCheckout}
            onStartShopping={() => setCurrentView('SHOP')}
          />
        );
      case 'ORDERS': return <Orders orders={orders} />;
      default: return <DashboardOverview />;
    }
  };

  if (!isAuthenticated) {
    return (
      <AuthScreen
        view={currentView === 'REGISTER' ? 'REGISTER' : 'LOGIN'}
        onLogin={handleLogin}
        onNavigate={(view) => setCurrentView(view)}
      />
    );
  }

  return (
    <DashboardLayout
      currentView={currentView}
      onNavigate={setCurrentView}
      onLogout={handleLogout}
      cartItemCount={cartItemCount}
    >
      {renderView()}
    </DashboardLayout>
  );
};

export default App;