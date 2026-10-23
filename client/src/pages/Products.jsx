import { useState, useEffect, useCallback } from 'react';
import {
  Package, Plus, Search, Filter, Edit2, Trash2, X, Check, AlertCircle, RefreshCw, Box, AlertTriangle, Layers
} from 'lucide-react';
import { productAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['All Categories', 'Electronics', 'Peripherals', 'Accessories', 'Furniture', 'Audio', 'General'];

const Products = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    price: '',
    costPrice: '',
    stock: '',
    reorderLevel: '10',
    unit: 'pcs',
    location: 'Main Warehouse - Shelf A1',
    status: 'Active',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({
        search,
        category: selectedCategory,
        status: selectedStatus,
      });
      setProducts(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedStatus, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Electronics',
      price: '',
      costPrice: '',
      stock: '',
      reorderLevel: '10',
      unit: 'pcs',
      location: 'Main Warehouse - Shelf A1',
      status: 'Active',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      sku: p.sku || '',
      category: p.category || 'Electronics',
      price: p.price ?? '',
      costPrice: p.costPrice ?? '',
      stock: p.stock ?? '',
      reorderLevel: p.reorderLevel ?? '10',
      unit: p.unit || 'pcs',
      location: p.location || 'Main Warehouse - Shelf A1',
      status: p.status || 'Active',
      description: p.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Please enter product name and price');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct._id, formData);
        toast.success(`Updated "${formData.name}" successfully`);
      } else {
        await productAPI.create(formData);
        toast.success(`Created "${formData.name}" successfully`);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to delete "${p.name}"?`)) return;
    try {
      await productAPI.delete(p._id);
      toast.success(`Deleted "${p.name}"`);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      await productAPI.seed();
      toast.success('Sample catalog records loaded successfully!');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to load sample records');
    } finally {
      setLoading(false);
    }
  };

  // Metrics calculation
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'Active').length;
  const lowStockCount = products.filter((p) => Number(p.stock) <= Number(p.reorderLevel || 10)).length;
  const totalValue = products.reduce((acc, p) => acc + (Number(p.stock) || 0) * (Number(p.price) || 0), 0);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Products Catalog</h1>
          <p className="page-description">Manage product details, SKUs, pricing, and stock thresholds.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="products-seed-btn"
            onClick={handleSeedData}
            title="Reload default sample records"
            className="btn-secondary text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sample Data
          </button>
          <button id="products-add-btn" onClick={handleOpenAddModal} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Total SKUs</span>
            <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Package className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalProducts}</p>
          <p className="text-xs text-gray-400 mt-1">Catalog items</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Active Items</span>
            <span className="p-2 bg-blue-50 rounded-lg text-blue-600"><Layers className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{activeProducts}</p>
          <p className="text-xs text-gray-400 mt-1">Ready for sale</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Low Stock Alerts</span>
            <span className="p-2 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{lowStockCount}</p>
          <p className="text-xs text-amber-600/70 mt-1">Below reorder point</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Catalog Retail Value</span>
            <span className="p-2 bg-violet-50 rounded-lg text-violet-600"><Box className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{totalValue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Potential retail revenue</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="products-search"
              type="text"
              placeholder="Search by name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="flex gap-2">
            <select
              id="products-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input w-44"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              id="products-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input w-36"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading catalog records...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No products found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Get started by adding your first product record or click sample data to populate automatically.
            </p>
            <button onClick={handleOpenAddModal} className="btn-primary mt-4">
              <Plus className="w-4 h-4" /> Add Product Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Price</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Reorder</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const isLow = Number(p.stock) <= Number(p.reorderLevel || 10);
                  const isZero = Number(p.stock) === 0;
                  return (
                    <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.location || 'Warehouse A'}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.sku}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ₹{Number(p.price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-semibold ${
                            isZero ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                          }`}
                        >
                          {p.stock} {p.unit || 'pcs'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">
                        {p.reorderLevel} {p.unit || 'pcs'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={p.status === 'Active' ? 'badge-green' : 'badge-gray'}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Product"
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            title="Delete Product"
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Bluetooth Mouse"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MSE-BT-01"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 1499"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 900"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Reorder Point</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="pcs"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Warehouse / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Main Warehouse - Shelf B2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Optional product notes or features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
