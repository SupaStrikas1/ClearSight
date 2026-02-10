const mongoose = require('mongoose');

const imageHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  degradedUrl: { type: String, required: true },    // Cloudinary URL
  cleanUrl: { type: String, required: true },       // Cloudinary URL
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ImageHistory', imageHistorySchema);