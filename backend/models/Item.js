const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found', 'registered'], required: true },
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: { type: Date, required: true },
  time: { type: String, default: '' },
  description: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resolved: { type: Boolean, default: false },
  qrCode: { type: String, default: '' },
  qrCodeNumber: { type: Number, default: null, index: true },
  linkedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  isLost: { type: Boolean, default: false }, // User marks their registered item as lost
}, { timestamps: true });

// Static method to get next available QR code number
itemSchema.statics.getNextQrCodeNumber = async function () {
  const lastItem = await this.findOne({ qrCodeNumber: { $gte: 1000, $lte: 1100 } }).sort({ qrCodeNumber: -1 });
  if (!lastItem) return 1000;
  if (lastItem.qrCodeNumber >= 1100) return null; // All numbers used
  return lastItem.qrCodeNumber + 1;
};

module.exports = mongoose.model('Item', itemSchema);
