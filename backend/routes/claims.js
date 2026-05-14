const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/email');

// POST /api/claims — submit a claim
router.post('/', protect, async (req, res) => {
  try {
    const { itemId, evidence } = req.body;
    if (!itemId || !evidence)
      return res.status(400).json({ message: 'Item and evidence are required' });

    const item = await Item.findById(itemId).populate('user');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.user._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'You cannot claim your own item' });

    const existing = await Claim.findOne({ item: itemId, claimant: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already submitted a claim for this item' });

    const claim = await Claim.create({ item: itemId, claimant: req.user._id, evidence });

    // Notify item owner
    const owner = await User.findById(item.user._id);
    if (owner) {
      owner.notifications.push({
        message: `A new ownership claim was submitted for your item: "${item.title}"`,
        type: 'claim_submitted',
        relatedItem: item._id,
      });
      await owner.save();

      // Send email notification to owner
      try {
        await sendEmail({
          email: owner.email,
          subject: 'New Claim Submitted for Your Item',
          message: `A new ownership claim was submitted for your item: "${item.title}". Please log in to review it.`,
          html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #3b82f6">New Claim Submitted</h2>
                  <p>A new ownership claim was submitted for your item: <strong>"${item.title}"</strong>.</p>
                  <p>Please log in to your dashboard to review the evidence and approve or reject the claim.</p>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="font-size: 0.8rem; color: #666;">This is an automated notification from FINDRA.</p>
                </div>`
        });
      } catch (emailErr) {
        console.error('Email failed to send:', emailErr.message);
      }
    }

    const populated = await claim.populate([
      { path: 'item', select: 'title type' },
      { path: 'claimant', select: 'fullName email' },
    ]);
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/claims/my — get my claims
router.get('/my', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item', 'title type location date image')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/claims/item/:itemId — get claims for an item (owner or admin)
router.get('/item/:itemId', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    const claims = await Claim.find({ item: req.params.itemId })
      .populate('claimant', 'fullName email phone')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/claims/:id — admin approve/reject
router.patch('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Admin only' });

    const { status, adminNote } = req.body;
    const claim = await Claim.findById(req.params.id).populate('item').populate('claimant');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    claim.status = status;
    claim.adminNote = adminNote || '';
    await claim.save();

    // Notify claimant
    const claimant = await User.findById(claim.claimant._id);
    if (claimant) {
      const msg = status === 'approved'
        ? `Your claim for "${claim.item.title}" has been APPROVED! Please contact the item owner.`
        : `Your claim for "${claim.item.title}" has been rejected. Reason: ${adminNote || 'No reason given'}`;
      
      claimant.notifications.push({
        message: msg,
        type: status === 'approved' ? 'claim_approved' : 'claim_rejected',
        relatedItem: claim.item._id,
      });
      await claimant.save();

      // Also send an email notification
      try {
        await sendEmail({
          email: claimant.email,
          subject: `Ownership Claim Update: ${status.toUpperCase()}`,
          message: msg,
          html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: ${status === 'approved' ? '#22c55e' : '#ef4444'}">Claim ${status.toUpperCase()}</h2>
                  <p>${msg}</p>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="font-size: 0.8rem; color: #666;">This is an automated notification from FINDRA. Please do not reply to this email.</p>
                </div>`
        });
      } catch (emailErr) {
        console.error('Email failed to send:', emailErr.message);
      }
    }

    // If approved, mark item as resolved
    if (status === 'approved') {
      await Item.findByIdAndUpdate(claim.item._id, { resolved: true });
    }

    res.json(claim);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
