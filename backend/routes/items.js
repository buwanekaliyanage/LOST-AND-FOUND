const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const Item = require('../models/Item');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/email');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Images only'));
  },
});

// GET /api/items
router.get('/', async (req, res) => {
  try {
    const { type, search, location, category } = req.query;
    const query = {};
    const andConds = [];

    if (type === 'lost') {
      andConds.push({ $or: [{ type: 'lost' }, { type: 'registered', isLost: true }] });
    } else if (type) {
      andConds.push({ type });
    }

    if (location) andConds.push({ location });
    if (category) andConds.push({ category });
    if (search) {
      andConds.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ]
      });
    }

    if (andConds.length > 0) query.$and = andConds;
    const items = await Item.find(query).populate('user', 'fullName email phone').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/items/user/me
router.get('/user/me', protect, async (req, res) => {
  try {
    const items = await Item.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/items/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', 'fullName email phone');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/items
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { type, title, category, location, date, time, description, qrCodeNumber } = req.body;

    // Check if this is a QR code registration
    const isQrRegistration = type === 'registered' || (qrCodeNumber !== '' && !location && !date && !description);

    // Validate required fields - allow QR registration without location/date/description
    if (!type || !title || !category)
      return res.status(400).json({ message: 'Title and category are required' });

    if (!isQrRegistration && (!location || !date || !description))
      return res.status(400).json({ message: 'All fields are required' });

    // Get QR code number - use provided one or auto-generate
    let assignedQrCodeNumber = qrCodeNumber;

    // Validate provided QR code number
    if (assignedQrCodeNumber) {
      const num = parseInt(assignedQrCodeNumber);
      if (isNaN(num) || num < 1000 || num > 1100) {
        return res.status(400).json({ message: 'QR Code number must be between 1000 and 1100' });
      }
      // Check if already used - Only block if it's a NEW registration
      const existing = await Item.findOne({ qrCodeNumber: num });
      if (existing && type === 'registered') {
        return res.status(400).json({ message: 'This QR Code number is already in use' });
      }
    } else {
      // Auto-assign next available number
      assignedQrCodeNumber = await Item.getNextQrCodeNumber();
      if (!assignedQrCodeNumber) {
        return res.status(400).json({ message: 'No more QR Code numbers available (1000-1100)' });
      }
    }

    const item = await Item.create({
      type,
      title,
      category,
      location: location || 'Other',
      date: date ? new Date(date) : new Date(),
      time: time || '',
      description: description || `QR Code #${assignedQrCodeNumber} registered item`,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      user: req.user._id,
      qrCodeNumber: assignedQrCodeNumber,
    });

    // Link to existing item if qrCodeNumber provided (linking via QR code number)
    // Send notification when someone reports a FOUND item matching an existing REGISTERED or LOST item's QR code
    if (qrCodeNumber && type === 'found') {
      const linkedItem = await Item.findOne({ 
        qrCodeNumber: parseInt(qrCodeNumber), 
        $or: [{ type: 'lost' }, { type: 'registered' }] 
      }).populate('user');

      if (linkedItem) {
        item.linkedItem = linkedItem._id;
        linkedItem.linkedItem = item._id;
        await linkedItem.save();

        // Notify the owner of the linked item
        const owner = linkedItem.user;
        if (owner) {
          const msg = `Good news! Someone found an item matching your QR code #${qrCodeNumber} ("${linkedItem.title}")!`;
          
          owner.notifications.push({
            message: msg,
            type: 'qr_link',
            relatedItem: item._id,
          });
          await owner.save();

          // Send Email Notification
          try {
            await sendEmail({
              email: owner.email,
              subject: 'Your Item Has Been Found!',
              message: `${msg}\n\nPlease log in to your FINDRA account to see the details of the found report and contact the person who found it.`,
              html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                      <h2 style="color: #22c55e">Your Item Has Been Found!</h2>
                      <p>Good news! Someone has reported finding an item matching your QR code: <strong>#${qrCodeNumber}</strong> ("${linkedItem.title}").</p>
                      <p>You can now log in to your FINDRA dashboard to view the found report details and contact the finder.</p>
                      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                      <p style="font-size: 0.8rem; color: #666;">This is an automated notification from FINDRA. We help you stay connected with your belongings.</p>
                    </div>`
            });
          } catch (emailErr) {
            console.error('Email failed to send:', emailErr.message);
          }
        }
      }
    }

    // Generate QR code pointing to the QR lookup page for this item
    const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/qr/${assignedQrCodeNumber}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 300, margin: 2 });
    item.qrCode = qrDataUrl;
    await item.save();

    const populated = await item.populate('user', 'fullName email phone');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/items/qr/:number
router.get('/qr/:number', async (req, res) => {
  try {
    const number = parseInt(req.params.number);
    if (isNaN(number)) return res.status(400).json({ message: 'Invalid QR code number' });
    const item = await Item.findOne({ qrCodeNumber: number }).populate('user', 'fullName email phone');
    if (!item) return res.status(404).json({ message: 'Item not found for this QR code' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/items/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/items/:id/resolve
router.patch('/:id/resolve', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.resolved = !item.resolved;
    await item.save();
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/items/:id/lost - Toggle isLost status for registered items
router.patch('/:id/lost', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    item.isLost = !item.isLost;
    await item.save();
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/items/:id/qr-scan  — called when someone scans QR code
router.post('/:id/qr-scan', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', 'fullName email phone');
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Add notification to item owner
    const User = require('../models/User');
    const owner = await User.findById(item.user._id);
    if (owner) {
      owner.notifications.push({
        message: `Someone scanned the QR code for your item: "${item.title}"`,
        type: 'qr_scan',
        relatedItem: item._id,
      });
      await owner.save();

      // Send Email Notification for QR Scan
      try {
        await sendEmail({
          email: owner.email,
          subject: 'Your QR Code Was Scanned!',
          message: `Someone just scanned the QR code for your item: "${item.title}".\n\nThis could mean someone has found your item. Please check your FINDRA dashboard for any new reports or contact information.`,
          html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #3b82f6">QR Code Scanned</h2>
                  <p>Someone just scanned the QR code for your item: <strong>"${item.title}"</strong>.</p>
                  <p>This is often a sign that someone has found your item and is looking for owner information.</p>
                  <p>Log in to your FINDRA account to see if there are any new messages or found reports matching your item.</p>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="font-size: 0.8rem; color: #666;">This is an automated notification from FINDRA.</p>
                </div>`
        });
      } catch (emailErr) {
        console.error('Email failed to send for QR scan:', emailErr.message);
      }
    }

    res.json({ item, message: 'QR scan recorded. Owner has been notified.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
