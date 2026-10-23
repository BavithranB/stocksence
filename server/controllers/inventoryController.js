const inventoryService = require('../services/inventoryService');

// @desc    Get inventory summary and stock levels
// @route   GET /api/inventory
// @access  Private
const getInventory = async (req, res, next) => {
  try {
    const { search, location, status } = req.query;
    const products = await inventoryService.getProducts({ search });
    
    // Enrich with calculated stock statuses
    const inventoryItems = products.map((p) => {
      const stock = Number(p.stock) || 0;
      const reorder = Number(p.reorderLevel) || 10;
      let stockStatus = 'In Stock';
      if (stock === 0) stockStatus = 'Out of Stock';
      else if (stock <= reorder) stockStatus = 'Low Stock';

      return {
        _id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        stock,
        reorderLevel: reorder,
        unit: p.unit || 'pcs',
        location: p.location || 'Main Warehouse - Section A',
        stockStatus,
        price: p.price,
        costPrice: p.costPrice,
        inventoryValue: stock * (p.costPrice || p.price || 0),
      };
    });

    const filtered = inventoryItems.filter((item) => {
      const matchesLocation = !location || location === 'All Locations' || item.location.includes(location);
      const matchesStatus = !status || status === 'All Stock Status' || item.stockStatus === status;
      return matchesLocation && matchesStatus;
    });

    res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust stock / add stock entry
// @route   POST /api/inventory/adjust
// @access  Private
const adjustStock = async (req, res, next) => {
  try {
    const { productId, type, quantity, reason, location } = req.body;
    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
    }
    const result = await inventoryService.adjustStock({ productId, type, quantity, reason, location });
    res.status(200).json({ success: true, message: 'Stock updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory audit movement logs
// @route   GET /api/inventory/logs
// @access  Private
const getInventoryLogs = async (req, res, next) => {
  try {
    const logs = await inventoryService.getInventoryLogs();
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  adjustStock,
  getInventoryLogs,
};
