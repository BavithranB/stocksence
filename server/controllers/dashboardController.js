const { getDashboardMetrics } = require('../services/inventoryService');

// @desc    Get dashboard summary metrics
// @route   GET /api/dashboard/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const metrics = await getDashboardMetrics();
    res.status(200).json({ success: true, data: metrics.summary });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales trend data (last 7 / 30 days)
// @route   GET /api/dashboard/sales-trend
// @access  Private
const getSalesTrend = async (req, res, next) => {
  try {
    const metrics = await getDashboardMetrics();
    res.status(200).json({
      success: true,
      data: metrics.salesTrend,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent sales transactions
// @route   GET /api/dashboard/recent-sales
// @access  Private
const getRecentSales = async (req, res, next) => {
  try {
    const metrics = await getDashboardMetrics();
    res.status(200).json({
      success: true,
      data: metrics.recentSales,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low-stock products
// @route   GET /api/dashboard/low-stock
// @access  Private
const getLowStock = async (req, res, next) => {
  try {
    const metrics = await getDashboardMetrics();
    res.status(200).json({
      success: true,
      data: metrics.lowStock,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getSalesTrend, getRecentSales, getLowStock };
