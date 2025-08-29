const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET /api/chat/history - Get chat history
router.get('/history', async (req, res) => {
  try {
    const { room = 'general', limit = 50 } = req.query;
    const messages = await Message.find({ room })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

// POST /api/chat/message - Send a chat message
router.post('/message', async (req, res) => {
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
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// GET /api/chat/rooms - Get available chat rooms
router.get('/rooms', (req, res) => {
  const rooms = [
    { id: 'general', name: 'General Chat', description: 'Main chat room' },
    { id: 'random', name: 'Random', description: 'Off-topic discussions' },
    { id: 'help', name: 'Help & Support', description: 'Get help from the community' }
  ];
  
  res.json(rooms);
});

let clients = [];

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  console.log('Client connected to stream'); // Log connection
  clients.push(res);

  // Remove the client when the connection is closed
  req.on('close', () => {
    console.log('Client disconnected from stream'); // Log disconnection
    clients = clients.filter(client => client !== res);
  });
});

// Function to broadcast messages to all connected clients
const broadcastMessage = (message) => {
  console.log('Broadcasting message:', message); // Log the message being broadcasted
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(message)}\n\n`);
  });
};

// POST /api/chat/message - Send a chat message
router.post('/message', async (req, res) => {
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
    broadcastMessage(message); // Broadcast the message to all clients
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Test endpoint to verify stream functionality
router.get('/test-stream', (req, res) => {
  res.json({ message: 'Stream is working!' });
});

module.exports = router;
