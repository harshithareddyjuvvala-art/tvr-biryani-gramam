const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const menu = require('./menu.js');
const orders = [];
const reservations = [];

// MENU
app.get('/api/menu', (req, res) => res.json({ success: true, data: menu }));
app.get('/api/menu/categories', (req, res) => res.json({ success: true, data: Object.keys(menu) }));
app.get('/api/menu/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const results = [];
  for (const [cat, items] of Object.entries(menu))
    items.forEach(item => { if (item.name.toLowerCase().includes(q)) results.push({ ...item, cat }); });
  res.json({ success: true, data: results });
});

// ORDERS
app.post('/api/orders', (req, res) => {
  const { customerName, phone, address, orderType, items, specialInstructions } = req.body;
  if (!customerName || !phone || !items || !items.length)
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const order = {
    id: uuidv4(),
    orderNumber: `TVR-${Date.now().toString().slice(-6)}`,
    customerName, phone, address, orderType, items,
    specialInstructions: specialInstructions || '',
    total, status: 'received',
    placedAt: new Date().toISOString()
  };
  orders.push(order);
  res.status(201).json({
    success: true, message: 'Order placed!',
    data: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total, status: 'received',
      estimatedTime: orderType === 'delivery' ? '45-60 minutes' : '20-30 minutes'
    }
  });
});
app.get('/api/orders', (req, res) => res.json({ success: true, data: orders }));
app.get('/api/orders/:id', (req, res) => {
  const o = orders.find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  o ? res.json({ success: true, data: o }) : res.status(404).json({ success: false, message: 'Not found' });
});

// RESERVATIONS
app.post('/api/reservations', (req, res) => {
  const { name, phone, date, time, guests, specialRequests } = req.body;
  if (!name || !phone || !date || !time || !guests)
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  const resDate = new Date(`${date}T${time}`);
  if (isNaN(resDate)) return res.status(400).json({ success: false, message: 'Invalid date/time' });
  const hour = resDate.getHours();
  if (hour < 11 || hour >= 23) return res.status(400).json({ success: false, message: 'We are open 11AM-11PM' });
  const reservation = {
    id: uuidv4(),
    confirmationCode: `RES-${Date.now().toString().slice(-6)}`,
    name, phone, date, time, guests: parseInt(guests),
    specialRequests: specialRequests || '',
    status: 'confirmed', createdAt: new Date().toISOString()
  };
  reservations.push(reservation);
  res.status(201).json({
    success: true, message: 'Reservation confirmed!',
    data: { confirmationCode: reservation.confirmationCode, name, date, time, guests: reservation.guests, status: 'confirmed' }
  });
});
app.get('/api/reservations', (req, res) => res.json({ success: true, data: reservations }));
app.get('/api/reservations/:id', (req, res) => {
  const r = reservations.find(r => r.id === req.params.id || r.confirmationCode === req.params.id);
  r ? res.json({ success: true, data: r }) : res.status(404).json({ success: false, message: 'Not found' });
});

// Serve HTML
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => {
  console.log(`\n🍛 TVR Biryani Gramam → http://localhost:${PORT}\n`);
});
