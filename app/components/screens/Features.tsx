import React, { useState } from 'react';
import { 
  Plus, Search, MoreHorizontal, Trash2, Edit2, 
  Filter, ShoppingCart, CreditCard, CheckCircle, 
  ShieldCheck, Package, Users, ExternalLink, Check, X, UserPlus
} from 'lucide-react';
import { Card, Button, Badge, Select, Modal, Input } from '../UI';
import { Role, Product, CartItem, Order, User } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

// --- USER MANAGEMENT ---
interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: Role.USER,
    status: 'Active' as 'Active' | 'Inactive'
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: Role.USER,
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        ...formData
      });
    } else {
      onAddUser(formData);
    }
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(u => 
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500">Manage system access and employees.</p>
        </div>
        <Button icon={UserPlus} onClick={handleOpenAdd}>Add User</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500" 
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="outline" icon={Filter} className="hidden sm:flex">Filter</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                      <div>
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="neutral">{user.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'Active' ? 'success' : 'warning'}>{user.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteUser(user.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                 <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                     No users found matching your search.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? "Edit User" : "Add New User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              placeholder="Jane" 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
            />
            <Input 
              label="Last Name" 
              placeholder="Doe" 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
            />
          </div>
          
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="jane@example.com" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Role"
              options={[
                { value: Role.ADMIN, label: 'Administrator' },
                { value: Role.MANAGER, label: 'Manager' },
                { value: Role.USER, label: 'Standard User' }
              ]}
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
            />
            
            <Select 
              label="Status"
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' }
              ]}
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="w-full">{editingUser ? 'Update User' : 'Create User'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// --- ROLE MANAGEMENT ---
interface RoleManagementProps {
    users: User[];
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ users }) => {
    // Define all possible permissions in the system
    const allPermissions = [
        'Read Access', 
        'Write Access', 
        'Delete Access', 
        'Manage Users', 
        'Manage Roles',
        'Manage Products',
        'View Analytics',
        'Process Orders',
        'Access Settings'
    ];

    // State for role permissions
    const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
        [Role.ADMIN]: ['Read Access', 'Write Access', 'Delete Access', 'Manage Users', 'Manage Roles', 'View Analytics', 'Process Orders', 'Access Settings'],
        [Role.MANAGER]: ['Read Access', 'Write Access', 'Manage Products', 'Process Orders', 'View Analytics'],
        [Role.USER]: ['Read Access', 'Process Orders']
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [tempPermissions, setTempPermissions] = useState<string[]>([]);

    const handleEditClick = (role: Role) => {
        setEditingRole(role);
        setTempPermissions(rolePermissions[role] || []);
        setIsEditModalOpen(true);
    };

    const handleTogglePermission = (perm: string) => {
        if (tempPermissions.includes(perm)) {
            setTempPermissions(tempPermissions.filter(p => p !== perm));
        } else {
            setTempPermissions([...tempPermissions, perm]);
        }
    };

    const handleSavePermissions = () => {
        if (editingRole) {
            setRolePermissions({
                ...rolePermissions,
                [editingRole]: tempPermissions
            });
            setIsEditModalOpen(false);
            setEditingRole(null);
        }
    };

    const getUserCount = (role: Role) => {
        return users.filter(u => u.role === role).length;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
                    <p className="text-gray-500">Define permissions and access levels.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {Object.values(Role).map((role) => (
                    <Card key={role} className="p-6 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                role === Role.ADMIN ? 'bg-purple-100 text-purple-600' : 
                                role === Role.MANAGER ? 'bg-blue-100 text-blue-600' : 
                                'bg-green-100 text-green-600'
                            }`}>
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <button 
                                onClick={() => handleEditClick(role)}
                                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{role}</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {getUserCount(role)} active {getUserCount(role) === 1 ? 'user' : 'users'}
                        </p>
                        
                        <div className="space-y-3 flex-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Capabilities</p>
                            {rolePermissions[role]?.slice(0, 5).map((perm) => (
                                <div key={perm} className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>{perm}</span>
                                </div>
                            ))}
                            {(rolePermissions[role]?.length || 0) > 5 && (
                                <p className="text-xs text-gray-400 pl-6">
                                    + {(rolePermissions[role]?.length || 0) - 5} more permissions
                                </p>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Edit Role Modal */}
            <Modal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title={`Edit ${editingRole} Permissions`}
            >
                <div className="space-y-6">
                    <div className="bg-brand-50 p-4 rounded-lg border border-brand-100">
                        <p className="text-sm text-brand-800">
                            Select the permissions you want to grant to the <strong>{editingRole}</strong> role. 
                            Users assigned this role will immediately inherit these capabilities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                        {allPermissions.map((perm) => {
                            const isSelected = tempPermissions.includes(perm);
                            return (
                                <label 
                                    key={perm} 
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                        isSelected 
                                            ? 'bg-brand-50 border-brand-200 ring-1 ring-brand-200' 
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                        isSelected ? 'bg-brand-600 border-brand-600' : 'bg-white border-gray-300'
                                    }`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={isSelected}
                                        onChange={() => handleTogglePermission(perm)}
                                    />
                                    <span className={`text-sm font-medium ${isSelected ? 'text-brand-900' : 'text-gray-700'}`}>
                                        {perm}
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            className="w-full" 
                            onClick={handleSavePermissions}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// --- SHOP & PRODUCT ---
export const Shop = ({ products, onAddToCart }: { products: Product[], onAddToCart: (p: Product) => void }) => {
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const filteredProducts = categoryFilter === 'all' 
    ? products 
    : products.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Shop Supplies</h2>
                <p className="text-gray-500">Order kits and replacements.</p>
            </div>
            <div className="flex gap-2">
                 <Select 
                    options={[
                        {value: 'all', label: 'All Categories'}, 
                        {value: 'dental', label: 'Dental'},
                        {value: 'cosmetic', label: 'Cosmetic'},
                        {value: 'accessories', label: 'Accessories'}
                    ]} 
                    className="w-40" 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                 />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
                <Card key={product.id} className="group flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant="neutral">{product.category}</Badge>
                            <span className="font-bold text-gray-900">${product.price}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                        <div className="mt-auto">
                            <Button onClick={() => onAddToCart(product)} className="w-full" variant="secondary" icon={ShoppingCart}>
                                Add to Cart
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
            {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                    <p className="text-gray-500">Try changing the category filter.</p>
                </div>
            )}
        </div>
    </div>
  );
};

// --- CART ---
export const Cart = ({ items, onCheckout, onStartShopping }: { items: CartItem[], onCheckout: () => void, onStartShopping: () => void }) => {
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                    <ShoppingCart className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Your cart is empty</h2>
                <p className="text-gray-500 max-w-sm">Looks like you haven't added any products to your cart yet.</p>
                <Button variant="secondary" onClick={onStartShopping} className="mt-4">Start Shopping</Button>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({items.length})</h2>
                {items.map(item => (
                    <Card key={item.id} className="p-4 flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-gray-200 rounded-lg">
                                <span className="px-3 py-1 text-gray-500 text-sm">Qty:</span>
                                <span className="px-2 text-sm font-bold">{item.quantity}</span>
                            </div>
                            <p className="font-bold text-gray-900 w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="space-y-6">
                <Card className="p-6 sticky top-24">
                    <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                    <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tax (10%)</span>
                            <span>${(total * 0.1).toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-gray-900 mb-6">
                        <span>Total</span>
                        <span>${(total * 1.1).toFixed(2)}</span>
                    </div>
                    <Button onClick={onCheckout} className="w-full py-3" variant="primary" icon={CreditCard}>
                        Place Order
                    </Button>
                </Card>
            </div>
        </div>
    );
};

// --- ORDERS ---
export const Orders = ({ orders }: { orders: Order[] }) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                    <p className="text-gray-500">Track your past purchases and status.</p>
                </div>
            </div>
            
            <Card className="overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-gray-900">#{order.id}</td>
                                    <td className="px-6 py-4">{order.date}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={
                                            order.status === 'Delivered' ? 'success' : 
                                            order.status === 'Processing' ? 'warning' : 
                                            'neutral'
                                        }>
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">{order.items.length} Items</td>
                                    <td className="px-6 py-4 font-medium">${order.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-brand-600 hover:bg-brand-50"
                                            onClick={() => setSelectedOrder(order)}
                                            icon={ExternalLink}
                                        >
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No orders found. Start shopping to see your history here.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </Card>

            {/* Order Details Modal */}
            <Modal 
                isOpen={!!selectedOrder} 
                onClose={() => setSelectedOrder(null)} 
                title={`Order Details #${selectedOrder?.id}`}
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-semibold text-gray-900">{selectedOrder.status}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Order Date</p>
                                <p className="font-semibold text-gray-900">{selectedOrder.date}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg">
                                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                            <p className="font-bold text-gray-900">Total Amount</p>
                            <p className="font-bold text-2xl text-brand-600">${selectedOrder.total.toFixed(2)}</p>
                        </div>

                        <Button className="w-full" variant="outline" onClick={() => setSelectedOrder(null)}>
                            Close Details
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    )
}

// --- OVERVIEW CHART WIDGET ---
export const DashboardOverview = () => {
    const data = [
        { name: 'Mon', orders: 40, amt: 2400 },
        { name: 'Tue', orders: 30, amt: 1398 },
        { name: 'Wed', orders: 20, amt: 9800 },
        { name: 'Thu', orders: 27, amt: 3908 },
        { name: 'Fri', orders: 18, amt: 4800 },
        { name: 'Sat', orders: 23, amt: 3800 },
        { name: 'Sun', orders: 34, amt: 4300 },
    ];

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-brand-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">$24,500</p>
                        </div>
                        <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
                            <CreditCard className="w-6 h-6" />
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Orders</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Patients</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">89</p>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                </Card>
             </div>

             <div className="grid lg:grid-cols-2 gap-6">
                 <Card className="p-6">
                     <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Revenue</h3>
                     <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={data}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                                 <Tooltip 
                                    cursor={{fill: '#f9fafb'}} 
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                 />
                                 <Bar dataKey="amt" fill="#EA580C" radius={[4, 4, 0, 0]} barSize={40} />
                             </BarChart>
                         </ResponsiveContainer>
                     </div>
                 </Card>

                 <Card className="p-6">
                     <h3 className="text-lg font-bold text-gray-900 mb-6">Order Volume</h3>
                     <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={data}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                 <Tooltip 
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                 />
                                 <Line type="monotone" dataKey="orders" stroke="#1F2937" strokeWidth={3} dot={{r: 4, fill: '#1F2937'}} activeDot={{r: 6}} />
                             </LineChart>
                         </ResponsiveContainer>
                     </div>
                 </Card>
             </div>
        </div>
    )
}