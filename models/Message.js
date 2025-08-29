const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Message content
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
    validate: {
      validator: function(text) {
        return text.trim().length > 0;
      },
      message: 'Message text cannot be empty'
    }
  },
  
  // Sender information (reference to User model)
  sender: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  // Chat room identifier
  room: {
    type: String,
    required: true,
    default: 'general',
    index: true
  },
  
  // Message type (text, image, file, etc.)
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Message', messageSchema);
