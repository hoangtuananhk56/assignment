import React, { useState } from 'react';
import {
  Users, ShieldCheck, ShoppingBag,
  ShoppingCart, Package, LogOut, Search, Bell, Menu, X
} from 'lucide-react';
import { ViewState } from '../../types';

interface DashboardProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  children: React.ReactNode;
  cartItemCount?: number;
}

export const DashboardLayout: React.FC<DashboardProps> = ({ currentView, onNavigate, onLogout, children, cartItemCount = 0 }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = localStorage.getItem('user')

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors ${currentView === view
        ? 'bg-brand-50 text-brand-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${currentView === view ? 'text-brand-600' : 'text-gray-400'}`} />
        {label}
      </div>
      {view === 'CART' && cartItemCount > 0 && (
        <span className="bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {cartItemCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-brand-600 tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              32Co
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {JSON.parse(user || '{}').roleName === 'admin' && (
              <>
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Management</p>
                <NavItem view="USERS" icon={Users} label="Users" />
                <NavItem view="ROLES" icon={ShieldCheck} label="Roles & Permissions" />
                <NavItem view="PRODUCTS" icon={Package} label="Products" />
              </>
            )}

            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Commerce</p>
            <NavItem view="SHOP" icon={ShoppingBag} label="Shop" />
            <NavItem view="CART" icon={ShoppingCart} label="Cart" />
            <NavItem view="ORDERS" icon={Package} label="Orders" />
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <img src="https://picsum.photos/100/100?random=1" alt="User" className="w-8 h-8 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {JSON.parse(user || '{}').firstName || 'User'} {JSON.parse(user || '{}').lastName || ''}
                </p>
                <p className="text-xs text-gray-500 truncate">{JSON.parse(user || '{}').email || 'user@32co.com'}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500">
              <Menu className="w-6 h-6" />
            </button>

            {/* Search Bar - Google Style */}
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients, orders, or products..."
                className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => onNavigate('CART')}
              >
                {cartItemCount > 0 ? (
                  <ShoppingCart className="w-5 h-5 text-brand-600" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
                {cartItemCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full border-2 border-white"></span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};