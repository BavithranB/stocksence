const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getSummary,
  getSalesTrend,
  getRecentSales,
  getLowStock,
} = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect); // All dashboard routes require auth

router.get('/summary', getSummary);
router.get('/sales-trend', getSalesTrend);
router.get('/recent-sales', getRecentSales);
router.get('/low-stock', getLowStock);

module.exports = router;
