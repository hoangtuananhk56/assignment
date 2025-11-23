import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, UploadCloud } from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select, TextArea } from '../UI';
import { Product } from '../../types';

interface ProductManagementProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({ products, onAddProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Dental',
    stock: '',
    description: '',
    image: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
        name: newProduct.name,
        price: Number(newProduct.price) || 0,
        category: newProduct.category,
        stock: Number(newProduct.stock) || 0,
        description: newProduct.description,
        image: newProduct.image || `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`
    });
    setIsModalOpen(false);
    setNewProduct({ name: '', price: '', category: 'Dental', stock: '', description: '', image: '' });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-500">Manage catalog items and inventory.</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Add Product</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500" 
                    placeholder="Search products..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="neutral">{product.category}</Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">${product.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        {product.stock}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                  <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No products found.
                      </td>
                  </tr>
              )}
            </tbody>
        </table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Product Name" 
                    placeholder="e.g., Clear Aligner Kit" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    required
                />
                <Select 
                    label="Category" 
                    options={[
                        {value: 'Dental', label: 'Dental'},
                        {value: 'Cosmetic', label: 'Cosmetic'},
                        {value: 'Accessories', label: 'Accessories'},
                        {value: 'Consumables', label: 'Consumables'},
                    ]}
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Price ($)" 
                    type="number" 
                    placeholder="0.00" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                />
                <Input 
                    label="Stock Quantity" 
                    type="number" 
                    placeholder="0" 
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    required
                    min="0"
                />
            </div>
            <TextArea 
                label="Description" 
                placeholder="Product details..." 
                rows={3}
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
            />
            
            <Input 
                label="Image URL (Optional)" 
                placeholder="https://..." 
                icon={UploadCloud}
                value={newProduct.image}
                onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
            />

            <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="w-full">Create Product</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};