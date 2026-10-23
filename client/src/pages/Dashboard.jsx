import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, Warehouse, ShoppingCart, AlertTriangle, TrendingUp, RefreshCcw, Plus, ArrowRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { useToast } from '../context/ToastContext';

// Demo data shown when DB has no records — clearly labeled
const DEMO_SALES_TREND = [
  { date: 'Oct 8', sales: 0 },
  { date: 'Oct 9', sales: 0 },
  { date: 'Oct 10', sales: 0 },
  { date: 'Oct 11', sales: 0 },
  { date: 'Oct 12', sales: 0 },
  { date: 'Oct 13', sales: 0 },
  { date: 'Oct 14', sales: 0 },
];

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const SalesChart = ({ data, isEmpty }) => {
  if (isEmpty) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No sales data yet"
        description="Start recording sales to see your sales trend chart here."
      />
    );
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          labelStyle={{ color: '#374151', fontWeight: 600 }}
        />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#10b981' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const InventoryPieChart = ({ data, isEmpty }) => {
  if (isEmpty) {
    return (
      <EmptyState
        icon={Warehouse}
        title="No inventory data"
        description="Add products and assign stock to see inventory distribution."
      />
    );
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const SkeletonRow = () => (
  <tr>
    {[1, 2, 3, 4].map((i) => (
      <td key={i} className="px-4 py-3">
        <div className="skeleton h-4 w-full max-w-[100px]" />
      </td>
    ))}
  </tr>
);

const Dashboard = () => {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [salesTrend, setSalesTrend] = useState({ trend: [], isEmpty: true });
  const [recentSales, setRecentSales] = useState({ sales: [], isEmpty: true });
  const [lowStock, setLowStock] = useState({ products: [], isEmpty: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, trendRes, salesRes, stockRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getSalesTrend(),
        dashboardAPI.getRecentSales(),
        dashboardAPI.getLowStock(),
      ]);
      setSummary(summaryRes.data.data);
      setSalesTrend(trendRes.data.data);
      setRecentSales(salesRes.data.data);
      setLowStock(stockRes.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load dashboard data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = [
    {
      title: 'Total Products',
      value: loading ? '—' : (summary?.totalProducts ?? 0).toLocaleString(),
      icon: Package,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      trendLabel: 'Products in catalog',
    },
    {
      title: 'Inventory Units',
      value: loading ? '—' : (summary?.totalInventoryUnits ?? 0).toLocaleString(),
      icon: Warehouse,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      trendLabel: 'Units across all locations',
    },
    {
      title: 'Total Sales',
      value: loading ? '—' : `₹${(summary?.totalSales ?? 0).toLocaleString()}`,
      icon: ShoppingCart,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
      trendLabel: 'All-time revenue',
    },
    {
      title: 'Low-Stock Alerts',
      value: loading ? '—' : (summary?.lowStockProducts ?? 0).toLocaleString(),
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      trendLabel: 'Products below threshold',
    },
  ];

  if (error && !loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Overview of your inventory and sales performance.</p>
        </div>
        <ErrorState message={error} onRetry={fetchDashboard} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Overview of your inventory and sales performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/products" className="btn-secondary text-xs">
            <Plus className="w-3.5 h-3.5" /> Add Product
          </Link>
          <Link to="/sales" className="btn-secondary text-xs">
            <ShoppingCart className="w-3.5 h-3.5" /> Record Sale
          </Link>
          <button
            id="dashboard-refresh-btn"
            onClick={fetchDashboard}
            disabled={loading}
            className="btn-primary text-xs"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Onboarding banner when DB is empty */}
      {!loading && summary?.isEmpty && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Welcome to STOCKSENSE!</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              Your workspace is ready. Start by adding products and inventory to see your dashboard come alive.
            </p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} loading={loading} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Sales Trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Sales Trend</h2>
            <span className="text-xs text-gray-400">Last 7 days</span>
          </div>
          {loading ? (
            <div className="h-[220px] flex items-end gap-2 pb-4">
              {[40, 55, 35, 70, 45, 60, 50].map((h, i) => (
                <div key={i} className="flex-1 skeleton rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
          ) : (
            <SalesChart data={salesTrend.trend} isEmpty={salesTrend.isEmpty} />
          )}
        </div>

        {/* Inventory Distribution */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Inventory Distribution</h2>
            <span className="text-xs text-gray-400">By category</span>
          </div>
          {loading ? (
            <div className="h-[220px] flex items-center justify-center">
              <div className="skeleton w-32 h-32 rounded-full" />
            </div>
          ) : (
            <InventoryPieChart
              data={summary?.inventoryDistribution || []}
              isEmpty={!summary?.inventoryDistribution || summary.inventoryDistribution.length === 0}
            />
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Recent Sales */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Sales</h2>
          </div>
          {loading ? (
            <table className="w-full">
              <tbody>
                {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          ) : recentSales.isEmpty ? (
            <EmptyState
              icon={ShoppingCart}
              title="No sales recorded"
              description={recentSales.message}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Amount</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentSales.sales.map((sale, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{sale.product}</td>
                      <td className="px-4 py-3 text-gray-600">{sale.quantity}</td>
                      <td className="px-4 py-3 text-gray-600">₹{sale.amount}</td>
                      <td className="px-4 py-3 text-gray-400">{sale.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Low-Stock Products</h2>
          </div>
          {loading ? (
            <table className="w-full">
              <tbody>
                {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          ) : lowStock.isEmpty ? (
            <EmptyState
              icon={AlertTriangle}
              title="No low-stock alerts"
              description={lowStock.message}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Stock</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Threshold</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lowStock.products.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.stock}</td>
                      <td className="px-4 py-3 text-gray-600">{p.threshold ?? p.reorderLevel ?? 10}</td>
                      <td className="px-4 py-3">
                        <span className="badge-red">Low</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Health Summary */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Inventory Health Summary</h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-4 w-full" />)}
          </div>
        ) : summary?.isEmpty ? (
          <p className="text-sm text-gray-400">
            Add inventory data to see your inventory health overview, including overstock and understock alerts.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-emerald-50/50 rounded-xl">
              <p className="text-2xl font-bold text-emerald-600">
                {Math.max(0, (summary?.totalProducts || 0) - (summary?.lowStockProducts || 0))}
              </p>
              <p className="text-xs text-gray-500 mt-1">Healthy SKUs</p>
            </div>
            <div className="text-center p-3 bg-amber-50/50 rounded-xl">
              <p className="text-2xl font-bold text-amber-500">
                {summary?.lowStockProducts || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Needs Reorder</p>
            </div>
            <div className="text-center p-3 bg-red-50/50 rounded-xl">
              <p className="text-2xl font-bold text-red-500">
                {lowStock.products?.filter((p) => p.stock === 0).length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Out of Stock</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
