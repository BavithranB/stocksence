import { useState, useEffect } from 'react';
import {
  RefreshCcw, Download, Check, Plus, Package, Clock, Truck, ShieldCheck, AlertCircle
} from 'lucide-react';
import { productAPI, inventoryAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const Replenishment = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderedItems, setOrderedItems] = useState({});

  const fetchReplenishmentData = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll();
      setProducts(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load replenishment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplenishmentData();
  }, []);

  const handleOrder = async (p, recommendedQty) => {
    try {
      await inventoryAPI.adjust({
        productId: p._id,
        type: 'restock',
        quantity: recommendedQty,
        reason: `Auto PO replenishment order approved`,
      });
      toast.success(`Purchase order for ${recommendedQty} units of ${p.name} fulfilled and added to stock!`);
      setOrderedItems((prev) => ({ ...prev, [p._id]: true }));
      fetchReplenishmentData();
    } catch (err) {
      toast.error('Failed to execute replenishment order');
    }
  };

  const handleExportPO = () => {
    const csvRows = [
      ['SKU', 'Product Name', 'Current Stock', 'Reorder Threshold', 'Recommended Order', 'Est. Cost (INR)'],
    ];

    products.forEach((p) => {
      const stock = Number(p.stock) || 0;
      const threshold = Number(p.reorderLevel) || 10;
      if (stock <= threshold) {
        const orderQty = Math.max(threshold * 2 - stock, 15);
        csvRows.push([
          p.sku,
          `"${p.name}"`,
          stock,
          threshold,
          orderQty,
          orderQty * (p.costPrice || p.price * 0.6),
        ]);
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Purchase_Order_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Purchase Order CSV exported!');
  };

  // Filter items needing replenishment
  const needsReplenishment = products.filter(
    (p) => Number(p.stock) <= Number(p.reorderLevel || 10)
  );

  const totalEstCost = needsReplenishment.reduce((acc, p) => {
    const qty = Math.max((p.reorderLevel || 10) * 2 - p.stock, 15);
    const unitCost = p.costPrice || p.price * 0.6;
    return acc + qty * unitCost;
  }, 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Replenishment & Purchase Orders</h1>
          <p className="page-description">Automated reorder recommendations based on consumption velocity and thresholds.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="replenishment-export-btn"
            onClick={handleExportPO}
            disabled={needsReplenishment.length === 0}
            className="btn-secondary"
          >
            <Download className="w-4 h-4" /> Export PO (CSV)
          </button>
          <button
            id="replenishment-generate-btn"
            onClick={fetchReplenishmentData}
            className="btn-primary"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh Recommendations
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Items Needing Reorder</span>
            <span className="p-2 bg-amber-50 rounded-lg text-amber-600"><AlertCircle className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{needsReplenishment.length}</p>
          <p className="text-xs text-amber-600/70 mt-1">Below safety thresholds</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Estimated Reorder Cost</span>
            <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Truck className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{Math.round(totalEstCost).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Batch restocking investment</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Supplier Lead Time Avg</span>
            <span className="p-2 bg-blue-50 rounded-lg text-blue-600"><Clock className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">3.2 Days</p>
          <p className="text-xs text-gray-400 mt-1">Average dispatch turnaround</p>
        </div>
      </div>

      {/* Recommendations Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Recommended Stock Replenishments</h2>
            <p className="text-xs text-gray-400">Calculated based on current inventory vs target safety buffers</p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Analyzing inventory levels...
          </div>
        ) : needsReplenishment.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No Replenishment Required!</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              All items currently have healthy inventory levels above their reorder points.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Current Stock</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Reorder Threshold</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Suggested Order Qty</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Est. Unit Cost</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {needsReplenishment.map((p) => {
                  const stock = Number(p.stock) || 0;
                  const threshold = Number(p.reorderLevel) || 10;
                  const recQty = Math.max(threshold * 2 - stock, 15);
                  const estCost = p.costPrice || Math.round(p.price * 0.65);

                  return (
                    <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{p.sku} • {p.category}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-red-600">{stock} {p.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-600">
                        {threshold} {p.unit}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700">
                        +{recQty} {p.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        ₹{estCost}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOrder(p, recQty)}
                          className="btn-primary text-xs py-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Restock
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
    </div>
  );
};

export default Replenishment;
