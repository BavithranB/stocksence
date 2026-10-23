const inventoryService = require('../services/inventoryService');

// @desc    Get all active alerts (low stock, out of stock)
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await inventoryService.getAlerts();
    res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
};
