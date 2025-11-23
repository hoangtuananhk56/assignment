import React, { useState, useEffect } from 'react';
import {
    Plus, Search, MoreHorizontal, Trash2, Edit2,
    Filter, ShoppingCart, CreditCard, CheckCircle,
    ShieldCheck, Package, Users, ExternalLink, Check, X, UserPlus
} from 'lucide-react';
import { Card, Button, Badge, Select, Modal, Input } from '../UI';
import { Pagination } from '../Pagination';
import { Role, Product, CartItem, Order, User } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import userService from '../../api/userService';
import productService from '../../api/productService';
import categoryService from '../../api/categoryService';
import orderService from '../../api/orderService';

// --- USER MANAGEMENT ---
interface UserManagementProps {
}

export const UserManagement: React.FC<UserManagementProps> = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [apiUsers, setApiUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const itemsPerPage = 10;

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roleName: Role.CUSTOMER,
        status: 'Active' as 'Active' | 'Inactive'
    });

    // Fetch users from API on mount
    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await userService.getAll(currentPage, itemsPerPage);
            console.log('Raw API response:', response); // Debug log
            console.log('Is array?', Array.isArray(response)); // Check if array
            console.log('Response type:', typeof response); // Check type

            // Handle different response structures
            let users = response;

            // If response is wrapped in a data property
            if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
                users = (response as any).data;
                const pagination = (response as any).pagination;
                if (pagination) {
                    setTotalPages(pagination.totalPages || 1);
                    setTotalUsers(pagination.total || 0);
                }
            }

            // Ensure users is an array
            setApiUsers(Array.isArray(users) ? users : []);
            console.log('Set users:', Array.isArray(users) ? users : []); // Debug what we set
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to fetch users:', err);
            setApiUsers([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditingUser(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            roleName: Role.CUSTOMER,
            status: 'Active'
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: any) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email,
            password: '',
            roleName: user.roleName === 'admin' ? Role.ADMIN : Role.CUSTOMER,
            status: 'Active'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (editingUser) {
                // Update user
                const updateData: any = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    roleName: formData.roleName,
                };

                if (formData.password) {
                    updateData.password = formData.password;
                }

                await userService.update(editingUser.id, updateData);
            } else {
                // Create user
                await userService.create({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    roleName: formData.roleName,
                });
            }

            setIsModalOpen(false);
            fetchUsers(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        setIsLoading(true);
        try {
            await userService.delete(id);
            fetchUsers(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = apiUsers.filter(u =>
        (u.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(filteredUsers)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-500">Manage system access and employees.</p>
                </div>
                <Button icon={UserPlus} onClick={handleOpenAdd}>Add User</Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

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
                            {isLoading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold">
                                                {((user.firstName?.[0] || user.email[0]) || 'U').toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.firstName || 'N/A'} {user.lastName || ''}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="neutral">{user.roleName || user.role?.name || 'user'}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="success">Active</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(user)}
                                                className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                                                title="Edit User"
                                                disabled={isLoading}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete User"
                                                disabled={isLoading}
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
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalUsers}
                    itemsPerPage={itemsPerPage}
                    currentItemsCount={apiUsers.length}
                    onPageChange={setCurrentPage}
                    isLoading={isLoading}
                />
            </Card>

            {/* User Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? "Edit User" : "Add New User"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            placeholder="Jane"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <Input
                            label="Last Name"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="jane@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <Input
                        label={editingUser ? "Password (leave blank to keep current)" : "Password"}
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingUser}
                    />

                    <Select
                        label="Role"
                        options={[
                            { value: 'admin', label: 'Administrator' },
                            { value: 'customer', label: 'Customer' }
                        ]}
                        value={formData.roleName}
                        onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    />

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="w-full" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            {editingUser ? 'Update User' : 'Create User'}
                        </Button>
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
        [Role.CUSTOMER]: ['Read Access', 'Write Access', 'Manage Products', 'Process Orders', 'View Analytics'],
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
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === Role.ADMIN ? 'bg-purple-100 text-purple-600' :
                                role === Role.CUSTOMER ? 'bg-blue-100 text-blue-600' :
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
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                        ? 'bg-brand-50 border-brand-200 ring-1 ring-brand-200'
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-600 border-brand-600' : 'bg-white border-gray-300'
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
export const Shop = ({ onAddToCart }: { onAddToCart: (p: Product) => void }) => {
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch products and categories on mount
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await productService.getAll();

            if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
                setProducts(response.data);
            } else if (Array.isArray(response)) {
                setProducts(response);
            } else {
                setProducts([]);
            }
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError(err.message || 'Failed to load products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll();

            if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
                setCategories(response.data);
            } else if (Array.isArray(response)) {
                setCategories(response);
            }
        } catch (err: any) {
            console.error('Error fetching categories:', err);
        }
    };

    const filteredProducts = categoryFilter === 'all'
        ? products
        : products.filter(p => p.category?.name?.toLowerCase() === categoryFilter.toLowerCase());

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Shop Supplies</h2>
                    <p className="text-gray-500">Order kits and replacements.</p>
                </div>
                <div className="flex gap-2">
                    <Select
                        options={[
                            { value: 'all', label: 'All Categories' },
                            ...categories.map(cat => ({
                                value: cat.name.toLowerCase(),
                                label: cat.name
                            }))
                        ]}
                        className="w-40"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        Loading products...
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                        <p className="text-gray-500">Try changing the category filter.</p>
                    </div>
                ) : (
                    filteredProducts.map(product => (
                        <Card key={product.id} className="group flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-[4/3] bg-gradient-to-br from-brand-50 to-brand-100 relative overflow-hidden flex items-center justify-center">
                                <Package className="w-16 h-16 text-brand-400" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="neutral">{product.category?.name || 'N/A'}</Badge>
                                    <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                                <p className="text-xs text-gray-400 mb-4">Stock: {product.stockQuantity}</p>
                                <div className="mt-auto">
                                    <Button
                                        onClick={() => onAddToCart(product)}
                                        className="w-full"
                                        variant="secondary"
                                        icon={ShoppingCart}
                                        disabled={product.stockQuantity === 0}
                                    >
                                        {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

// --- CART ---
export const Cart = ({ items, onCheckout, onStartShopping }: { items: CartItem[], onCheckout: () => void, onStartShopping: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handlePlaceOrder = async () => {
        try {
            setLoading(true);
            setError('');

            // Create order with items from cart
            const orderData = {
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            console.log('Creating order with data:', orderData);
            const order = await orderService.create(orderData);
            console.log('Order created successfully:', order);

            // Call the original onCheckout to clear cart and navigate
            onCheckout();
        } catch (err: any) {
            console.error('Error placing order:', err);
            setError(err.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

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

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {items.map(item => (
                    <Card key={item.id} className="p-4 flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg bg-brand-50 flex items-center justify-center">
                            <Package className="w-8 h-8 text-brand-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">
                                {(item as any).category?.name || (typeof (item as any).category === 'string' ? (item as any).category : 'N/A')}
                            </p>
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
                    <Button
                        onClick={handlePlaceOrder}
                        className="w-full py-3"
                        variant="primary"
                        icon={CreditCard}
                        disabled={loading}
                    >
                        {loading ? 'Placing Order...' : 'Place Order'}
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

// --- OVERVIEW CHART WIDGET (removed) ---
