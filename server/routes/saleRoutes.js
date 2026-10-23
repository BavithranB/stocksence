const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getSales,
  createSale,
} = require('../controllers/saleController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSales)
  .post(createSale);

module.exports = router;
