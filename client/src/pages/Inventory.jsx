import { useState, useEffect, useCallback } from 'react';
import {
  Warehouse, Plus, Search, Filter, ArrowUpRight, ArrowDownRight, History, Box, AlertTriangle, CheckCircle2, RefreshCw, X
} from 'lucide-react';
import { inventoryAPI, productAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const Inventory = () => {
  const toast = useToast();
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'logs'
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedStatus, setSelectedStatus] = useState('All Stock Status');

  // Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'restock',
    quantity: '10',
    location: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, prodRes, logRes] = await Promise.all([
        inventoryAPI.getAll({ search, location: selectedLocation, status: selectedStatus }),
        productAPI.getAll(),
        inventoryAPI.getLogs(),
      ]);
      setInventory(invRes.data.data || []);
      setProducts(prodRes.data.data || []);
      setLogs(logRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [search, selectedLocation, selectedStatus, toast]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleOpenModal = (preselectedProduct = null) => {
    const prod = preselectedProduct || products[0];
    setFormData({
      productId: prod ? prod._id : '',
      type: 'restock',
      quantity: '10',
      location: prod ? prod.location || 'Main Warehouse - Section A' : 'Main Warehouse - Section A',
      reason: 'Received supplier shipment',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity) {
      toast.error('Please select a product and quantity');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryAPI.adjust({
        productId: formData.productId,
        type: formData.type,
        quantity: Number(formData.quantity),
        location: formData.location,
        reason: formData.reason,
      });
      toast.success('Stock level adjusted successfully!');
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const totalUnits = inventory.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
  const lowStockCount = inventory.filter((item) => item.stockStatus === 'Low Stock').length;
  const outOfStockCount = inventory.filter((item) => item.stockStatus === 'Out of Stock').length;
  const totalValuation = inventory.reduce((sum, item) => sum + (Number(item.inventoryValue) || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-description">Real-time stock quantities, warehouse allocations, and movement records.</p>
        </div>
        <div className="flex items-center gap-2">
          <button id="inventory-add-btn" onClick={() => handleOpenModal()} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Stock Entry
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Total Units in Stock</span>
            <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Warehouse className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalUnits.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Units on hand</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Low Stock Items</span>
            <span className="p-2 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{lowStockCount}</p>
          <p className="text-xs text-amber-600/70 mt-1">Needs reordering</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Out of Stock</span>
            <span className="p-2 bg-red-50 rounded-lg text-red-600"><Box className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">{outOfStockCount}</p>
          <p className="text-xs text-red-600/70 mt-1">0 units remaining</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Inventory Asset Value</span>
            <span className="p-2 bg-blue-50 rounded-lg text-blue-600"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{totalValuation.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Cost valuation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('stock')}
          className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'stock'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Stock On Hand ({inventory.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Movement Audit Logs ({logs.length})
        </button>
      </div>

      {activeTab === 'stock' ? (
        <>
          {/* Filters */}
          <div className="card p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="inventory-search"
                  type="text"
                  placeholder="Search inventory..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-9"
                />
              </div>
              <div className="flex gap-2">
                <select
                  id="inventory-location-filter"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="input w-44"
                >
                  <option value="All Locations">All Locations</option>
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Warehouse 2">Warehouse 2</option>
                  <option value="Secure Vault">Secure Vault</option>
                </select>
                <select
                  id="inventory-status-filter"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input w-40"
                >
                  <option value="All Stock Status">All Stock Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stock Table */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                Loading inventory...
              </div>
            ) : inventory.length === 0 ? (
              <div className="p-12 text-center">
                <Warehouse className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-800">No inventory records</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  Add stock entries or products to begin tracking inventory across locations.
                </p>
                <button onClick={() => handleOpenModal()} className="btn-primary mt-4">
                  <Plus className="w-4 h-4" /> Add Stock Entry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Product / SKU</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Location</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Stock vs Reorder Threshold</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Asset Value</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventory.map((item) => {
                      const stockRatio = Math.min(100, Math.round((item.stock / (item.reorderLevel * 2)) * 100));
                      const isZero = item.stock === 0;
                      const isLow = item.stockStatus === 'Low Stock';

                      return (
                        <tr key={item._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-400 font-mono">{item.sku} • {item.category}</div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {item.location}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={
                                isZero ? 'badge-red' : isLow ? 'badge-yellow' : 'badge-green'
                              }
                            >
                              {item.stockStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 min-w-[200px]">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-gray-800">
                                {item.stock} {item.unit}
                              </span>
                              <span className="text-gray-400">
                                Reorder: {item.reorderLevel} {item.unit}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isZero ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.max(5, stockRatio)}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            ₹{Number(item.inventoryValue).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                            >
                              Adjust
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Audit Logs Tab */
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Inventory Movement Logs</h2>
            <span className="text-xs text-gray-400">All inbound, outbound and adjustment actions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Action Type</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Quantity</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Stock Result</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Reason / Notes</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{l.productName}</div>
                      <div className="text-xs text-gray-400 font-mono">{l.sku}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`capitalize px-2 py-0.5 rounded text-xs font-medium ${
                          l.type === 'restock'
                            ? 'bg-emerald-100 text-emerald-700'
                            : l.type === 'sale'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {l.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      <span className={l.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {l.quantity > 0 ? `+${l.quantity}` : l.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {l.previousStock} → <span className="font-bold text-gray-800">{l.newStock}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{l.notes || '—'}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      {new Date(l.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900">Add Stock Entry / Adjustment</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Product *</label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="input"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku}) — Current Stock: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Adjustment Action *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'restock' })}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-colors ${
                      formData.type === 'restock'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    + Restock
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'damage' })}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-colors ${
                      formData.type === 'damage'
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    - Loss / Damage
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'adjustment' })}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-colors ${
                      formData.type === 'adjustment'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Set Count
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location / Shelf</label>
                <input
                  type="text"
                  placeholder="e.g. Main Warehouse - Shelf B2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Supplier PO delivery or physical count correction"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="input"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Updating...' : 'Save Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
