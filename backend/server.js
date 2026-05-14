const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes  = require('./routes/auth');
const itemRoutes  = require('./routes/items');
const userRoutes  = require('./routes/users');
const claimRoutes = require('./routes/claims');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',   authRoutes);
app.use('/api/items',  itemRoutes);
app.use('/api/users',  userRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin',  adminRoutes);

// Seed admin account if not exists
const seedAdmin = async () => {
  const User = require('./models/User');
  const exists = await User.findOne({ email: 'admin@lostandfound.com' });
  if (!exists) {
    await User.create({
      fullName: 'System Admin',
      email: 'admin@lostandfound.com',
      phone: '+94 000000000',
      password: 'admin123',
      role: 'admin',
    });
    console.log('✅ Admin seeded: admin@lostandfound.com / admin123');
  }
};

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAdmin();
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => { console.error('❌ MongoDB error:', err.message); process.exit(1); });
