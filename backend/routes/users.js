const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

// GET /api/users/me
router.get('/me', protect, async (req, res) => {
  try {
    const lostCount = await Item.countDocuments({ user: req.user._id, type: 'lost' });
    const foundCount = await Item.countDocuments({ user: req.user._id, type: 'found' });
    const user = await User.findById(req.user._id).select('-password');
    res.json({ ...user.toObject(), lostCount, foundCount });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/users/me
router.put('/me', protect, async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const user = await User.findById(req.user._id);
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password && password.length >= 6) user.password = password;
    await user.save();
    res.json({ _id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/users/me
router.delete('/me', protect, async (req, res) => {
  try {
    await Item.deleteMany({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users/notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json(user.notifications.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/users/notifications/read-all
router.patch('/notifications/read-all', protect, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { 'notifications.$[].isRead': true } }
    );
    res.json({ message: 'All marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
