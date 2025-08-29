const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle MongoDB duplicate key errors specifically
    if (err.code === 11000) {
      // Check if it's a username duplicate or email duplicate
      if (err.keyPattern && err.keyPattern.username) {
        return res.status(400).json({ message: 'Username already exists' });
      } else if (err.keyPattern && err.keyPattern.email) {
        // This handles the case where there's an old email index in the database
        return res.status(400).json({ 
          message: 'Registration failed due to database configuration issue. Please contact administrator.' 
        });
      }
    }
    
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid Username' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Password' });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return user object without password
    const userWithoutPassword = { 
      _id: user._id, 
      username: user.username, 
      role: user.role, // Include role
      createdAt: user.createdAt 
    };
    res.json({ token, user: userWithoutPassword });
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
