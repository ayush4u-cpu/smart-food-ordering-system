const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ----------------------------------------------------
// 1. DATABASE CONNECTION
// ----------------------------------------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'manager',
  database: process.env.DB_NAME || 'smart_food',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper to generate a basic mock token 'id:role'
const generateToken = (id, role) => {
  return `${id}:${role}`;
};

// ----------------------------------------------------
// 2. AUTHENTICATION MIDDLEWARES
// ----------------------------------------------------
const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // Parse custom token format 'id:role'
      const [id, role] = token.split(':');
      req.user = { id: parseInt(id), role };
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// ----------------------------------------------------
// 3. AUTHENTICATION ROUTES
// ----------------------------------------------------

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Save password directly in plain text for simplicity
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      role: 'user',
      token: generateToken(result.insertId, 'user'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    // Simple plain-text password comparison
    if (users.length > 0 && password === users[0].password) {
      res.json({
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        role: users[0].role,
        token: generateToken(users[0].id, users[0].role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Profile
app.get('/api/auth/profile', protect, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------------------------------------------------
// 4. FOOD MENU ROUTES
// ----------------------------------------------------

// Get All Food Items
app.get('/api/foods', async (req, res) => {
  try {
    const [foods] = await pool.query('SELECT * FROM foods ORDER BY created_at DESC');
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a New Food Item (Admin only)
app.post('/api/foods', protect, admin, async (req, res) => {
  try {
    const { name, price, category, image } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO foods (name, price, category, image) VALUES (?, ?, ?, ?)',
      [name, price, category, image || null]
    );

    res.status(201).json({ id: result.insertId, name, price, category, image });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a Food Item (Admin only)
app.put('/api/foods/:id', protect, admin, async (req, res) => {
  try {
    const { name, price, category, image } = req.body;
    const foodId = req.params.id;

    await pool.query(
      'UPDATE foods SET name = ?, price = ?, category = ?, image = ? WHERE id = ?',
      [name, price, category, image || null, foodId]
    );

    res.json({ id: foodId, name, price, category, image });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a Food Item (Admin only)
app.delete('/api/foods/:id', protect, admin, async (req, res) => {
  try {
    await pool.query('DELETE FROM foods WHERE id = ?', [req.params.id]);
    res.json({ message: 'Food removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------------------------------------------------
// 5. SHOPPING CART ROUTES
// ----------------------------------------------------

// Get Cart Items for Current User
app.get('/api/cart', protect, async (req, res) => {
  try {
    const [cartItems] = await pool.query(
      `SELECT c.id, c.quantity, c.food_id, f.name, f.price, f.image, f.category 
       FROM cart_items c 
       JOIN foods f ON c.food_id = f.id 
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Item to Cart
app.post('/api/cart', protect, async (req, res) => {
  try {
    const { food_id, quantity } = req.body;
    
    // Check if item already exists in user's cart
    const [existing] = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND food_id = ?',
      [req.user.id, food_id]
    );

    if (existing.length > 0) {
      // If it exists, update quantity
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND food_id = ?',
        [quantity || 1, req.user.id, food_id]
      );
    } else {
      // If new, insert row
      await pool.query(
        'INSERT INTO cart_items (user_id, food_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, food_id, quantity || 1]
      );
    }
    res.status(200).json({ message: 'Added to cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Cart Item Quantity
app.put('/api/cart/:id', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.id, req.user.id]
    );
    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove Item from Cart
app.delete('/api/cart/:id', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------------------------------------------------
// 6. ORDER ROUTES
// ----------------------------------------------------

// Place an Order
app.post('/api/orders', protect, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch user's cart items
    const [cartItems] = await connection.query(
      `SELECT c.quantity, c.food_id, f.price 
       FROM cart_items c 
       JOIN foods f ON c.food_id = f.id 
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total price
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Create order record
    const [orderRes] = await connection.query(
      'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
      [req.user.id, total, 'pending']
    );

    const orderId = orderRes.insertId;

    // Create order items
    const orderItemsData = cartItems.map(item => [orderId, item.food_id, item.quantity, item.price]);
    await connection.query(
      'INSERT INTO order_items (order_id, food_id, quantity, price) VALUES ?',
      [orderItemsData]
    );

    // Clear user's cart
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    await connection.commit();
    res.status(201).json({ message: 'Order placed successfully', orderId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// Get Current User's Orders
app.get('/api/orders', protect, async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    for (let order of orders) {
      const [items] = await pool.query(
        `SELECT oi.quantity, oi.price, f.name, f.image 
         FROM order_items oi 
         JOIN foods f ON oi.food_id = f.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Orders (Admin only)
app.get('/api/orders/admin', protect, admin, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Order Status (Admin only)
app.put('/api/orders/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------------------------------------------------
// 7. START SERVER
// ----------------------------------------------------
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Simple Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
