import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select, TextArea } from '../UI';
import productService, { Product } from '../../api/productService';
import categoryService, { Category } from '../../api/categoryService';

export const ProductManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    categoryId: '',
    stockQuantity: '',
    description: ''
  });

  // Fetch products and categories on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching products...');
      const response = await productService.getAll();
      console.log('Products API response:', response);

      // Handle paginated response {data: [], pagination: {}}
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (Array.isArray(response)) {
        // Fallback for non-paginated response
        setProducts(response);
      } else {
        console.error('Invalid products response:', response);
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
      console.log('Fetching categories...');
      const response = await categoryService.getAll();
      console.log('Categories API response:', response);

      // Handle paginated response {data: [], pagination: {}}
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (Array.isArray(response)) {
        // Fallback for non-paginated response
        setCategories(response);
      } else {
        console.error('Invalid categories response:', response);
        setCategories([]);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      // Don't show error for categories, just log it
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      const productData = {
        name: newProduct.name,
        price: Number(newProduct.price) || 0,
        categoryId: newProduct.categoryId,
        stockQuantity: Number(newProduct.stockQuantity) || 0,
        description: newProduct.description || undefined
      };

      if (editingProduct) {
        // Update existing product
        console.log('Updating product:', editingProduct.id, productData);
        await productService.update(editingProduct.id, productData);
      } else {
        // Create new product
        console.log('Creating product:', productData);
        await productService.create(productData);
      }

      // Refresh products list
      await fetchProducts();

      // Close modal and reset form
      setIsModalOpen(false);
      setEditingProduct(null);
      setNewProduct({ name: '', price: '', categoryId: '', stock: '', description: '', image: '' });
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      categoryId: product.categoryId,
      stockQuantity: product.stockQuantity.toString(),
      description: product.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setError('');
      console.log('Deleting product:', id);
      await productService.delete(id);
      await fetchProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setNewProduct({ name: '', price: '', categoryId: '', stockQuantity: '', description: '' });
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

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
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Loading products...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-brand-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-brand-600" />
                      </div>
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="neutral">{product.category?.name || 'N/A'}</Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      {product.stockQuantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1 text-gray-400 hover:text-blue-600"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-red-600"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleModalClose} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Name"
              placeholder="e.g., Clear Aligner Kit"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
            <Select
              label="Category"
              options={categories.map(cat => ({
                value: cat.id,
                label: cat.name
              }))}
              value={newProduct.categoryId}
              onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              placeholder="0.00"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              required
              min="0"
              step="0.01"
            />
            <Input
              label="Stock Quantity"
              type="number"
              placeholder="0"
              value={newProduct.stockQuantity}
              onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
              required
              min="0"
            />
          </div>
          <TextArea
            label="Description"
            placeholder="Product details..."
            rows={3}
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="w-full" onClick={handleModalClose}>Cancel</Button>
            <Button type="submit" className="w-full">{editingProduct ? 'Update Product' : 'Create Product'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};