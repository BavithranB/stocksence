const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getInventory,
  adjustStock,
  getInventoryLogs,
} = require('../controllers/inventoryController');

const router = express.Router();

router.use(protect);

router.get('/', getInventory);
router.post('/adjust', adjustStock);
router.get('/logs', getInventoryLogs);

module.exports = router;
