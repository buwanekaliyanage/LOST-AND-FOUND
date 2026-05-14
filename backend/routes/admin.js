const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { protect } = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

// GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalLost, totalFound, totalClaims, pendingClaims, resolved] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'pending' }),
      Item.countDocuments({ resolved: true }),
    ]);
    res.json({ totalUsers, totalLost, totalFound, totalClaims, pendingClaims, resolved });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    await Item.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/items
router.get('/items', protect, adminOnly, async (req, res) => {
  try {
    const { type, resolved } = req.query;
    const query = {};
    if (type) query.type = type;
    if (resolved !== undefined) query.resolved = resolved === 'true';
    const items = await Item.find(query).populate('user', 'fullName email').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/claims
router.get('/claims', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const claims = await Claim.find(query)
      .populate('item', 'title type location')
      .populate('claimant', 'fullName email phone')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
