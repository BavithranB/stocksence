const inventoryService = require('../services/inventoryService');

// @desc    Get all sales transactions
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res, next) => {
  try {
    const sales = await inventoryService.getSales();
    res.status(200).json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sale transaction (and deduct inventory)
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res, next) => {
  try {
    const { items, customerName, paymentMethod } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'At least one item is required for the sale' });
    }
    const sale = await inventoryService.createSale({ items, customerName, paymentMethod });
    res.status(201).json({ success: true, message: 'Sale recorded successfully', data: sale });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSales,
  createSale,
};
