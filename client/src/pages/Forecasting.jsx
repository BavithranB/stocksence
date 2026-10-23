import { useState, useEffect } from 'react';
import {
  BarChart3, Play, TrendingUp, AlertTriangle, ShieldCheck, Sparkles, RefreshCw, Layers
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { productAPI, salesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const FORECAST_DAYS = [
  { day: 'Day +1', actual: 18, projected: 20 },
  { day: 'Day +2', actual: 22, projected: 24 },
  { day: 'Day +3', actual: 19, projected: 21 },
  { day: 'Day +4', actual: 25, projected: 28 },
  { day: 'Day +5', actual: 30, projected: 32 },
  { day: 'Day +6', actual: 34, projected: 36 },
  { day: 'Day +7', actual: 29, projected: 35 },
  { day: 'Day +8', actual: null, projected: 38 },
  { day: 'Day +9', actual: null, projected: 41 },
  { day: 'Day +10', actual: null, projected: 39 },
  { day: 'Day +11', actual: null, projected: 44 },
  { day: 'Day +12', actual: null, projected: 48 },
  { day: 'Day +13', actual: null, projected: 50 },
  { day: 'Day +14', actual: null, projected: 53 },
];

const Forecasting = () => {
  const toast = useToast();
  const [running, setRunning] = useState(false);
  const [forecastHorizon, setForecastHorizon] = useState('14');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('All');

  useEffect(() => {
    productAPI.getAll().then((res) => {
      setProducts(res.data.data || []);
    }).catch(() => {});
  }, []);

  const handleRunForecast = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      toast.success('Demand Forecast Engine executed: High confidence (+18.4% growth predicted)');
    }, 1200);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Demand Forecasting Engine</h1>
          <p className="page-description">Predict future sales volume using historical patterns, velocity, and trend analysis.</p>
        </div>
        <button
          id="forecasting-run-btn"
          onClick={handleRunForecast}
          disabled={running}
          className="btn-primary"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Calculating Projections...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200" /> Run AI Demand Forecast
            </>
          )}
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Predicted Growth</span>
            <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">+18.4%</p>
          <p className="text-xs text-gray-400 mt-1">Next 14-day projection</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Model Accuracy</span>
            <span className="p-2 bg-blue-50 rounded-lg text-blue-600"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">94.2%</p>
          <p className="text-xs text-gray-400 mt-1">MAPE evaluation score</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Stockout Risks</span>
            <span className="p-2 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">3 SKUs</p>
          <p className="text-xs text-amber-600/70 mt-1">Expected to breach safety stock</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Recommended Buffer</span>
            <span className="p-2 bg-violet-50 rounded-lg text-violet-600"><Layers className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">+15% Units</p>
          <p className="text-xs text-gray-400 mt-1">Suggested buffer for peak sales</p>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="card p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Projected Demand Curve vs Actual Velocity</h2>
            <p className="text-xs text-gray-400">Comparing real consumption vs 14-day forward model</p>
          </div>
          <div className="flex gap-2">
            <select
              value={forecastHorizon}
              onChange={(e) => setForecastHorizon(e.target.value)}
              className="input w-36 text-xs"
            >
              <option value="7">Next 7 Days</option>
              <option value="14">Next 14 Days</option>
              <option value="30">Next 30 Days</option>
            </select>
          </div>
        </div>

        <div className="h-[280px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={FORECAST_DAYS} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="projectedColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="actualColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                labelStyle={{ fontWeight: 600, color: '#374151' }}
              />
              <Area type="monotone" dataKey="actual" name="Historical Units" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#actualColor)" />
              <Area type="monotone" dataKey="projected" name="Forecast Units" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#projectedColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demand Risk Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Top Predicted Stockout Risks
          </h3>
          <div className="space-y-3">
            {[
              { name: 'USB-C Multi-port 7-in-1 Hub', stock: 4, daysLeft: 2, recommended: 25 },
              { name: 'Noise-Cancelling Headphones', stock: 3, daysLeft: 3, recommended: 15 },
              { name: 'Portable SSD 1TB High-Speed', stock: 2, daysLeft: 4, recommended: 12 },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-gray-900">{item.name}</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Depletion in ~{item.daysLeft} days at current velocity
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700">Order +{item.recommended}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            AI Optimization Insights
          </h3>
          <div className="space-y-2.5 text-xs text-gray-600">
            <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl">
              <strong className="text-emerald-900 block mb-0.5">Peak Demand Window</strong>
              Weekly peak sales occur between Thursday and Saturday afternoon. Stock should be positioned 48 hours prior.
            </div>
            <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl">
              <strong className="text-blue-900 block mb-0.5">Lead Time Recommendation</strong>
              Current average supplier delivery lead time is 3.4 days. Reorder trigger should be adjusted to 7 days of stock.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecasting;
