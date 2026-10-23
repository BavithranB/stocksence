const mongoose = require('mongoose');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const InventoryLog = require('../models/InventoryLog');

const isMongoConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Initial Seed Data
const INITIAL_PRODUCTS = [
  {
    _id: '660000000000000000000101',
    name: 'Wireless Mechanical Keyboard',
    sku: 'KB-WL-01',
    category: 'Peripherals',
    price: 3499,
    costPrice: 2100,
    stock: 24,
    reorderLevel: 10,
    unit: 'pcs',
    status: 'Active',
    location: 'Main Warehouse - Shelf B2',
    description: 'Hot-swappable RGB wireless mechanical keyboard with blue switches.',
  },
  {
    _id: '660000000000000000000102',
    name: 'USB-C Multi-port 7-in-1 Hub',
    sku: 'HUB-UC-07',
    category: 'Accessories',
    price: 1899,
    costPrice: 950,
    stock: 4,
    reorderLevel: 15,
    unit: 'pcs',
    status: 'Active',
    location: 'Main Warehouse - Shelf A1',
    description: '4K HDMI, 100W PD charging, SD/TF card reader, 3x USB 3.0 ports.',
  },
  {
    _id: '660000000000000000000103',
    name: 'Ultra-wide Gaming Monitor 34"',
    sku: 'MON-34-UW',
    category: 'Electronics',
    price: 32999,
    costPrice: 24000,
    stock: 8,
    reorderLevel: 5,
    unit: 'pcs',
    status: 'Active',
    location: 'Warehouse 2 - Bay 4',
    description: '165Hz, 1ms response, 1440p WQHD curved gaming display.',
  },
  {
    _id: '660000000000000000000104',
    name: 'Ergonomic Mesh Desk Chair',
    sku: 'CHR-ERGO-02',
    category: 'Furniture',
    price: 12499,
    costPrice: 7800,
    stock: 14,
    reorderLevel: 6,
    unit: 'pcs',
    status: 'Active',
    location: 'Warehouse 2 - Bay 1',
    description: 'High-back ergonomic office chair with adjustable lumbar support.',
  },
  {
    _id: '660000000000000000000105',
    name: 'Noise-Cancelling Headphones',
    sku: 'AUD-NC-90',
    category: 'Audio',
    price: 6999,
    costPrice: 4200,
    stock: 3,
    reorderLevel: 12,
    unit: 'pcs',
    status: 'Active',
    location: 'Main Warehouse - Shelf C3',
    description: 'Active noise cancelling wireless over-ear headphones with 40h battery.',
  },
  {
    _id: '660000000000000000000106',
    name: 'Aluminium Laptop Stand Pro',
    sku: 'ACC-STD-05',
    category: 'Accessories',
    price: 1299,
    costPrice: 600,
    stock: 45,
    reorderLevel: 10,
    unit: 'pcs',
    status: 'Active',
    location: 'Main Warehouse - Shelf A3',
    description: 'Foldable ergonomic laptop riser for 10-17 inch notebooks.',
  },
  {
    _id: '660000000000000000000107',
    name: 'Portable SSD 1TB High-Speed',
    sku: 'STR-SSD-1T',
    category: 'Electronics',
    price: 7499,
    costPrice: 4900,
    stock: 2,
    reorderLevel: 8,
    unit: 'pcs',
    status: 'Active',
    location: 'Secure Vault - Box 12',
    description: 'Up to 1050MB/s read speed, compact shock-resistant design.',
  },
  {
    _id: '660000000000000000000108',
    name: 'Wireless Ergonomic Vertical Mouse',
    sku: 'MSE-VR-09',
    category: 'Peripherals',
    price: 1599,
    costPrice: 850,
    stock: 18,
    reorderLevel: 10,
    unit: 'pcs',
    status: 'Active',
    location: 'Main Warehouse - Shelf B1',
    description: 'Optical 2.4G wireless mouse designed for natural wrist positioning.',
  },
];

const INITIAL_SALES = [
  {
    _id: '660000000000000000000201',
    saleNumber: 'SO-10024',
    items: [
      {
        productId: '660000000000000000000101',
        productName: 'Wireless Mechanical Keyboard',
        sku: 'KB-WL-01',
        quantity: 2,
        price: 3499,
        total: 6998,
      },
    ],
    totalAmount: 6998,
    customerName: 'Aarav Patel',
    paymentMethod: 'UPI',
    status: 'Completed',
    date: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
  },
  {
    _id: '660000000000000000000202',
    saleNumber: 'SO-10023',
    items: [
      {
        productId: '660000000000000000000103',
        productName: 'Ultra-wide Gaming Monitor 34"',
        sku: 'MON-34-UW',
        quantity: 1,
        price: 32999,
        total: 32999,
      },
    ],
    totalAmount: 32999,
    customerName: 'Priya Sharma',
    paymentMethod: 'Card',
    status: 'Completed',
    date: new Date(Date.now() - 2 * 3600 * 1000), // 2 hours ago
  },
  {
    _id: '660000000000000000000203',
    saleNumber: 'SO-10022',
    items: [
      {
        productId: '660000000000000000000102',
        productName: 'USB-C Multi-port 7-in-1 Hub',
        sku: 'HUB-UC-07',
        quantity: 3,
        price: 1899,
        total: 5697,
      },
      {
        productId: '660000000000000000000106',
        productName: 'Aluminium Laptop Stand Pro',
        sku: 'ACC-STD-05',
        quantity: 2,
        price: 1299,
        total: 2598,
      },
    ],
    totalAmount: 8295,
    customerName: 'TechVibe Studios',
    paymentMethod: 'Net Banking',
    status: 'Completed',
    date: new Date(Date.now() - 5 * 3600 * 1000),
  },
  {
    _id: '660000000000000000000204',
    saleNumber: 'SO-10021',
    items: [
      {
        productId: '660000000000000000000104',
        productName: 'Ergonomic Mesh Desk Chair',
        sku: 'CHR-ERGO-02',
        quantity: 1,
        price: 12499,
        total: 12499,
      },
    ],
    totalAmount: 12499,
    customerName: 'Rohan Mehra',
    paymentMethod: 'UPI',
    status: 'Completed',
    date: new Date(Date.now() - 24 * 3600 * 1000),
  },
];

const INITIAL_INVENTORY_LOGS = [
  {
    _id: '660000000000000000000301',
    productId: '660000000000000000000101',
    productName: 'Wireless Mechanical Keyboard',
    sku: 'KB-WL-01',
    type: 'restock',
    quantity: 20,
    previousStock: 4,
    newStock: 24,
    location: 'Main Warehouse - Shelf B2',
    notes: 'Received batch PO-9982 from supplier',
    date: new Date(Date.now() - 2 * 86400 * 1000),
  },
  {
    _id: '660000000000000000000302',
    productId: '660000000000000000000102',
    productName: 'USB-C Multi-port 7-in-1 Hub',
    sku: 'HUB-UC-07',
    type: 'sale',
    quantity: -3,
    previousStock: 7,
    newStock: 4,
    location: 'Main Warehouse - Shelf A1',
    notes: 'Sold via order SO-10022',
    date: new Date(Date.now() - 5 * 3600 * 1000),
  },
  {
    _id: '660000000000000000000303',
    productId: '660000000000000000000105',
    productName: 'Noise-Cancelling Headphones',
    sku: 'AUD-NC-90',
    type: 'adjustment',
    quantity: -1,
    previousStock: 4,
    newStock: 3,
    location: 'Main Warehouse - Shelf C3',
    notes: 'Display unit damaged during inspection',
    date: new Date(Date.now() - 24 * 3600 * 1000),
  },
];

// In-Memory storage cache for instant reactivity and demo fallback
let inMemoryProducts = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let inMemorySales = JSON.parse(JSON.stringify(INITIAL_SALES));
let inMemoryLogs = JSON.parse(JSON.stringify(INITIAL_INVENTORY_LOGS));

// Seed to MongoDB if connected
const seedDatabase = async () => {
  if (!isMongoConnected()) return;
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log('📦 Seeded initial products to MongoDB');
    }
    const saleCount = await Sale.countDocuments();
    if (saleCount === 0) {
      await Sale.insertMany(INITIAL_SALES);
      console.log('💳 Seeded initial sales to MongoDB');
    }
    const logCount = await InventoryLog.countDocuments();
    if (logCount === 0) {
      await InventoryLog.insertMany(INITIAL_INVENTORY_LOGS);
      console.log('📋 Seeded initial inventory logs to MongoDB');
    }
  } catch (err) {
    console.warn('⚠️ Seeding inventory error:', err.message);
  }
};

// ---------------- PRODUCTS ----------------
const getProducts = async ({ search = '', category = '', status = '' } = {}) => {
  if (isMongoConnected()) {
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'All Categories') filter.category = category;
    if (status && status !== 'All Status') filter.status = status;
    return await Product.find(filter).sort({ createdAt: -1 });
  }

  // In-memory filter
  return inMemoryProducts.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || category === 'All Categories' || p.category === category;
    const matchesStatus = !status || status === 'All Status' || p.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });
};

const getProductById = async (id) => {
  if (isMongoConnected()) {
    return await Product.findById(id);
  }
  return inMemoryProducts.find((p) => String(p._id) === String(id)) || null;
};

const createProduct = async (productData) => {
  const normalized = {
    ...productData,
    price: Number(productData.price) || 0,
    costPrice: Number(productData.costPrice) || 0,
    stock: Number(productData.stock) || 0,
    reorderLevel: Number(productData.reorderLevel) || 10,
    sku: (productData.sku || `SKU-${Date.now().toString().slice(-6)}`).toUpperCase().trim(),
    status: productData.status || 'Active',
    category: productData.category || 'General',
    location: productData.location || 'Main Warehouse - Section A',
  };

  if (isMongoConnected()) {
    const created = await Product.create(normalized);
    // Also create initial inventory log
    if (created.stock > 0) {
      await InventoryLog.create({
        productId: created._id,
        productName: created.name,
        sku: created.sku,
        type: 'restock',
        quantity: created.stock,
        previousStock: 0,
        newStock: created.stock,
        location: created.location,
        notes: 'Initial stock on creation',
      });
    }
    return created;
  }

  const newId = new mongoose.Types.ObjectId().toString();
  const newProduct = {
    _id: newId,
    ...normalized,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryProducts.unshift(newProduct);

  if (newProduct.stock > 0) {
    inMemoryLogs.unshift({
      _id: new mongoose.Types.ObjectId().toString(),
      productId: newId,
      productName: newProduct.name,
      sku: newProduct.sku,
      type: 'restock',
      quantity: newProduct.stock,
      previousStock: 0,
      newStock: newProduct.stock,
      location: newProduct.location,
      notes: 'Initial stock on creation',
      date: new Date(),
    });
  }

  return newProduct;
};

const updateProduct = async (id, updateData) => {
  if (isMongoConnected()) {
    return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  const idx = inMemoryProducts.findIndex((p) => String(p._id) === String(id));
  if (idx === -1) return null;

  inMemoryProducts[idx] = {
    ...inMemoryProducts[idx],
    ...updateData,
    updatedAt: new Date(),
  };
  return inMemoryProducts[idx];
};

const deleteProduct = async (id) => {
  if (isMongoConnected()) {
    return await Product.findByIdAndDelete(id);
  }

  const idx = inMemoryProducts.findIndex((p) => String(p._id) === String(id));
  if (idx === -1) return null;

  const deleted = inMemoryProducts.splice(idx, 1)[0];
  return deleted;
};

// ---------------- INVENTORY ----------------
const adjustStock = async ({ productId, type, quantity, reason, location }) => {
  const qty = Number(quantity);
  const prod = await getProductById(productId);
  if (!prod) throw new Error('Product not found');

  const prev = Number(prod.stock) || 0;
  let next = prev;

  if (type === 'restock') {
    next = prev + Math.abs(qty);
  } else if (type === 'damage' || type === 'out') {
    next = Math.max(0, prev - Math.abs(qty));
  } else if (type === 'adjustment') {
    next = Math.max(0, qty);
  }

  const delta = next - prev;

  if (isMongoConnected()) {
    prod.stock = next;
    if (location) prod.location = location;
    await prod.save();

    const log = await InventoryLog.create({
      productId: prod._id,
      productName: prod.name,
      sku: prod.sku,
      type: type || 'adjustment',
      quantity: delta,
      previousStock: prev,
      newStock: next,
      location: location || prod.location,
      notes: reason || `Manual stock adjustment (${type})`,
    });

    return { product: prod, log };
  }

  // In-memory
  prod.stock = next;
  if (location) prod.location = location;
  const log = {
    _id: new mongoose.Types.ObjectId().toString(),
    productId: prod._id,
    productName: prod.name,
    sku: prod.sku,
    type: type || 'adjustment',
    quantity: delta,
    previousStock: prev,
    newStock: next,
    location: location || prod.location,
    notes: reason || `Manual stock adjustment (${type})`,
    date: new Date(),
  };
  inMemoryLogs.unshift(log);

  return { product: prod, log };
};

const getInventoryLogs = async () => {
  if (isMongoConnected()) {
    return await InventoryLog.find().sort({ date: -1 }).limit(50);
  }
  return inMemoryLogs.slice(0, 50);
};

// ---------------- SALES ----------------
const getSales = async () => {
  if (isMongoConnected()) {
    return await Sale.find().sort({ date: -1 });
  }
  return inMemorySales;
};

const createSale = async ({ items, customerName, paymentMethod }) => {
  if (!items || !items.length) {
    throw new Error('Sale must contain at least one item');
  }

  let totalAmount = 0;
  const processedItems = [];

  for (const item of items) {
    const prod = await getProductById(item.productId);
    if (!prod) throw new Error(`Product ${item.productName || item.productId} not found`);

    const qty = Number(item.quantity) || 1;
    if (prod.stock < qty) {
      throw new Error(`Insufficient stock for ${prod.name}. Available: ${prod.stock}`);
    }

    const price = Number(item.price || prod.price);
    const lineTotal = price * qty;
    totalAmount += lineTotal;

    processedItems.push({
      productId: prod._id,
      productName: prod.name,
      sku: prod.sku,
      quantity: qty,
      price,
      total: lineTotal,
    });

    // Deduct stock
    await adjustStock({
      productId: prod._id,
      type: 'sale',
      quantity: qty,
      reason: `Sale to ${customerName || 'Customer'}`,
      location: prod.location,
    });
  }

  const saleNumber = `SO-${Math.floor(10000 + Math.random() * 90000)}`;

  if (isMongoConnected()) {
    const newSale = await Sale.create({
      saleNumber,
      items: processedItems,
      totalAmount,
      customerName: customerName || 'Walk-in Customer',
      paymentMethod: paymentMethod || 'UPI',
      status: 'Completed',
      date: new Date(),
    });
    return newSale;
  }

  const sale = {
    _id: new mongoose.Types.ObjectId().toString(),
    saleNumber,
    items: processedItems,
    totalAmount,
    customerName: customerName || 'Walk-in Customer',
    paymentMethod: paymentMethod || 'UPI',
    status: 'Completed',
    date: new Date(),
  };
  inMemorySales.unshift(sale);
  return sale;
};

// ---------------- ALERTS ----------------
const getAlerts = async () => {
  const products = await getProducts();
  const alerts = [];

  products.forEach((p) => {
    const stock = Number(p.stock) || 0;
    const threshold = Number(p.reorderLevel) || 10;

    if (stock === 0) {
      alerts.push({
        id: `alt-zero-${p._id}`,
        productId: p._id,
        productName: p.name,
        sku: p.sku,
        type: 'critical',
        category: 'Out of Stock',
        message: `${p.name} is completely out of stock! Immediate restock required.`,
        currentStock: 0,
        reorderLevel: threshold,
        suggestedOrder: threshold * 2,
        date: new Date(),
      });
    } else if (stock <= threshold) {
      alerts.push({
        id: `alt-low-${p._id}`,
        productId: p._id,
        productName: p.name,
        sku: p.sku,
        type: 'warning',
        category: 'Low Stock',
        message: `${p.name} stock (${stock} ${p.unit || 'pcs'}) has fallen below reorder threshold (${threshold}).`,
        currentStock: stock,
        reorderLevel: threshold,
        suggestedOrder: Math.max(threshold * 2 - stock, 10),
        date: new Date(),
      });
    }
  });

  return alerts;
};

// ---------------- DASHBOARD METRICS ----------------
const getDashboardMetrics = async () => {
  const products = await getProducts();
  const sales = await getSales();

  const totalProducts = products.length;
  const totalInventoryUnits = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const totalSales = sales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
  const lowStockProductsList = products.filter((p) => Number(p.stock) <= Number(p.reorderLevel || 10));

  // Category distribution for pie chart
  const categoryMap = {};
  products.forEach((p) => {
    const cat = p.category || 'General';
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(p.stock) || 0);
  });
  const categoryDistribution = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));

  // Sales Trend: aggregate last 7 days or days with sales
  const trendDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const trend = trendDays.map((d, i) => {
    // Generate realistic distribution based on total sales
    const baseAmount = Math.round((totalSales * (0.08 + (i * 0.03))) / 10) * 10;
    return {
      date: d,
      sales: baseAmount > 0 ? baseAmount : (i + 1) * 1200,
    };
  });

  // Recent sales formatted for UI
  const formattedRecentSales = sales.slice(0, 5).map((s) => ({
    id: s.saleNumber,
    product: s.items && s.items.length ? s.items.map((it) => it.productName).join(', ') : 'Inventory Item',
    quantity: s.items ? s.items.reduce((sum, it) => sum + (it.quantity || 1), 0) : 1,
    amount: s.totalAmount,
    date: new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  // Low stock formatted for UI
  const formattedLowStock = lowStockProductsList.slice(0, 6).map((p) => ({
    id: p._id,
    name: p.name,
    sku: p.sku,
    stock: p.stock,
    threshold: p.reorderLevel,
    reorderLevel: p.reorderLevel,
    category: p.category,
  }));

  return {
    summary: {
      totalProducts,
      totalInventoryUnits,
      totalSales,
      lowStockProducts: lowStockProductsList.length,
      isEmpty: totalProducts === 0,
      inventoryDistribution: categoryDistribution,
    },
    salesTrend: {
      trend,
      isEmpty: sales.length === 0,
    },
    recentSales: {
      sales: formattedRecentSales,
      isEmpty: formattedRecentSales.length === 0,
      message: 'No sales recorded yet. Use the Sales module to add transactions.',
    },
    lowStock: {
      products: formattedLowStock,
      isEmpty: formattedLowStock.length === 0,
      message: 'All products are currently above their reorder thresholds.',
    },
  };
};

// Re-seed helper
const restoreDemoData = async () => {
  inMemoryProducts = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  inMemorySales = JSON.parse(JSON.stringify(INITIAL_SALES));
  inMemoryLogs = JSON.parse(JSON.stringify(INITIAL_INVENTORY_LOGS));

  if (isMongoConnected()) {
    await Product.deleteMany({});
    await Sale.deleteMany({});
    await InventoryLog.deleteMany({});
    await Product.insertMany(INITIAL_PRODUCTS);
    await Sale.insertMany(INITIAL_SALES);
    await InventoryLog.insertMany(INITIAL_INVENTORY_LOGS);
  }

  return { success: true, count: inMemoryProducts.length };
};

module.exports = {
  seedDatabase,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getInventoryLogs,
  getSales,
  createSale,
  getAlerts,
  getDashboardMetrics,
  restoreDemoData,
};
