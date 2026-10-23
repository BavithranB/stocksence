import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Plus, Search, Filter, CreditCard, Banknote, Smartphone, CheckCircle, RefreshCw, X, Receipt, ArrowUpRight
} from 'lucide-react';
import { salesAPI, productAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const Sales = () => {
  const toast = useToast();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');

  // Record Sale Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchSalesData = useCallback(async () => {
    setLoading(true);
    try {
      const [salesRes, prodRes] = await Promise.all([
        salesAPI.getAll(),
        productAPI.getAll({ status: 'Active' }),
      ]);
      setSales(salesRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || 'Failed to fetch sales');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const handleOpenModal = () => {
    const activeProds = products.filter((p) => p.stock > 0);
    setSelectedProductId(activeProds.length ? activeProds[0]._id : products[0]?._id || '');
    setCustomerName('Walk-in Customer');
    setPaymentMethod('UPI');
    setQuantity(1);
    setIsModalOpen(true);
  };

  const selectedProduct = products.find((p) => p._id === selectedProductId);
  const calculatedTotal = selectedProduct ? (Number(selectedProduct.price) || 0) * (Number(quantity) || 0) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Please select a valid product');
      return;
    }
    if (quantity > selectedProduct.stock) {
      toast.error(`Only ${selectedProduct.stock} units available in stock`);
      return;
    }

    setSubmitting(true);
    try {
      await salesAPI.create({
        customerName,
        paymentMethod,
        items: [
          {
            productId: selectedProduct._id,
            productName: selectedProduct.name,
            sku: selectedProduct.sku,
            quantity: Number(quantity),
            price: Number(selectedProduct.price),
          },
        ],
      });
      toast.success('Sale transaction recorded successfully!');
      setIsModalOpen(false);
      fetchSalesData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
  const totalOrders = sales.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const totalUnitsSold = sales.reduce(
    (acc, s) => acc + (s.items ? s.items.reduce((sum, it) => sum + (it.quantity || 1), 0) : 1),
    0
  );

  // Filtered sales
  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      !search ||
      s.saleNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      s.items?.some((it) => it.productName.toLowerCase().includes(search.toLowerCase()));
    const matchesPayment = paymentFilter === 'All' || s.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Sales & Transactions</h1>
          <p className="page-description">Record point-of-sale orders and track customer purchases.</p>
        </div>
        <button id="sales-record-btn" onClick={handleOpenModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Record New Sale
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Total Revenue</span>
            <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><ShoppingCart className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">All recorded transactions</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Orders Completed</span>
            <span className="p-2 bg-blue-50 rounded-lg text-blue-600"><Receipt className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalOrders}</p>
          <p className="text-xs text-gray-400 mt-1">Total sales receipts</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Avg Order Value</span>
            <span className="p-2 bg-violet-50 rounded-lg text-violet-600"><ArrowUpRight className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{avgOrderValue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Per transaction average</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Units Sold</span>
            <span className="p-2 bg-amber-50 rounded-lg text-amber-600"><CheckCircle className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalUnitsSold}</p>
          <p className="text-xs text-gray-400 mt-1">Total products delivered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="sales-search"
              type="text"
              placeholder="Search by order ID, customer name, or item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="input w-44"
          >
            <option value="All">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="Net Banking">Net Banking</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading sales history...
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No sales transactions</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Record your first sale to start tracking customer transactions and inventory deductions.
            </p>
            <button onClick={handleOpenModal} className="btn-primary mt-4">
              <Plus className="w-4 h-4" /> Record New Sale
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Order ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Items Purchased</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Payment</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Total Amount</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSales.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-800">
                      {s.saleNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {s.customerName}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {s.items?.map((it, idx) => (
                        <div key={idx}>
                          <span className="font-semibold">{it.quantity}x</span> {it.productName}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {s.paymentMethod === 'UPI' && <Smartphone className="w-3 h-3 text-emerald-600" />}
                        {s.paymentMethod === 'Card' && <CreditCard className="w-3 h-3 text-blue-600" />}
                        {s.paymentMethod === 'Cash' && <Banknote className="w-3 h-3 text-amber-600" />}
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      ₹{Number(s.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge-green">{s.status || 'Completed'}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      {new Date(s.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900">Record Point-of-Sale Order</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar or Walk-in"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Product *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="input"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — ₹{p.price} ({p.stock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedProduct ? selectedProduct.stock : 999}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="input"
                  />
                  {selectedProduct && (
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Max available: {selectedProduct.stock}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>

              {/* Total Summary Box */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-emerald-800">Order Subtotal</span>
                  <p className="text-xs text-emerald-600">Automatic inventory deduction</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-800">₹{calculatedTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !selectedProduct} className="btn-primary">
                  {submitting ? 'Recording...' : 'Confirm & Save Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
