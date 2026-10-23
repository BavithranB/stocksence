const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts,
} = require('../controllers/productController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.post('/seed', seedProducts);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
