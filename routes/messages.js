const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET /api/messages - Get all messages
router.get('/', async (req, res) => {
  try {
    const { room = 'general', limit = 50 } = req.query;
    const messages = await Message.find({ room })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// POST /api/messages - Create a new message
router.post('/', async (req, res) => {
  try {
    const { sender, text, room = 'general' } = req.body;

    if (!sender || !text) {
      return res.status(400).json({ message: 'Sender and text are required' });
    }

    const message = new Message({
      sender,
      text,
      room
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Error creating message' });
  }
});

// GET /api/messages/:id - Get a specific message
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Error fetching message' });
  }
});

// DELETE /api/messages/:id - Delete a message (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message' });
  }
});

module.exports = router;
