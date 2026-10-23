import { useState, useEffect, useCallback } from 'react';
import {
  Bell, AlertTriangle, AlertCircle, CheckCircle, RefreshCw, ArrowRight, Package, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { alertsAPI, inventoryAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const Alerts = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [restockingId, setRestockingId] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await alertsAPI.getAll();
      setAlerts(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleQuickRestock = async (alert) => {
    setRestockingId(alert.id);
    try {
      await inventoryAPI.adjust({
        productId: alert.productId,
        type: 'restock',
        quantity: alert.suggestedOrder || 20,
        reason: 'Restocked from Alert notification',
      });
      toast.success(`Restocked ${alert.suggestedOrder || 20} units for ${alert.productName}`);
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to restock item');
    } finally {
      setRestockingId(null);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'Critical') return a.type === 'critical';
    if (severityFilter === 'Warning') return a.type === 'warning';
    return true;
  });

  const criticalCount = alerts.filter((a) => a.type === 'critical').length;
  const warningCount = alerts.filter((a) => a.type === 'warning').length;

  return (
    <div>
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Inventory Alerts & Thresholds</h1>
          <p className="page-description">Automated real-time warnings for low-stock and replenishment needs.</p>
        </div>
        <button onClick={fetchAlerts} className="btn-secondary">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Alerts
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Critical (Out of Stock)</span>
            <span className="p-2 bg-red-50 rounded-lg text-red-600"><AlertCircle className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">{criticalCount}</p>
          <p className="text-xs text-red-600/70 mt-1">Requires immediate order</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Warnings (Low Stock)</span>
            <span className="p-2 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{warningCount}</p>
          <p className="text-xs text-amber-600/70 mt-1">Below safety threshold</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">System Health</span>
            <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><ShieldAlert className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {alerts.length === 0 ? 'Optimal' : `${alerts.length} Flagged`}
          </p>
          <p className="text-xs text-gray-400 mt-1">Real-time status</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          {['All', 'Critical', 'Warning'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                severityFilter === sev
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">
          Showing {filteredAlerts.length} active alerts
        </span>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="card p-12 text-center text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          Checking thresholds...
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">All Stock Levels Healthy!</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            No products are currently under their critical reorder thresholds.
          </p>
          <button onClick={() => navigate('/products')} className="btn-secondary mt-4">
            View Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((a) => (
            <div
              key={a.id}
              className={`card p-5 border-l-4 transition-all ${
                a.type === 'critical' ? 'border-l-red-500 bg-red-50/20' : 'border-l-amber-500 bg-amber-50/20'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      a.type === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {a.type === 'critical' ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{a.productName}</span>
                      <span className="font-mono text-xs text-gray-500">({a.sku})</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          a.type === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {a.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{a.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span>Current Stock: <strong className="text-gray-800">{a.currentStock}</strong></span>
                      <span>Reorder Threshold: <strong className="text-gray-800">{a.reorderLevel}</strong></span>
                      <span>Suggested Order: <strong className="text-emerald-700">+{a.suggestedOrder}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleQuickRestock(a)}
                    disabled={restockingId === a.id}
                    className="btn-primary text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${restockingId === a.id ? 'animate-spin' : ''}`} />
                    Quick Restock (+{a.suggestedOrder})
                  </button>
                  <button
                    onClick={() => navigate('/inventory')}
                    className="btn-secondary text-xs"
                  >
                    View in Inventory <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
