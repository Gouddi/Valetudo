const mongoose = require('mongoose');
const passport = require('passport');
const settings = require('../config/settings');
require('../config/passport')(passport);
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User.js');

// Register route
router.post('/register', async (req, res) => {
  console.log('register route reached');

  if (!req.body.username || !req.body.password) {
    return res.json({
      success: false,
      msg: 'Please pass username and password.'
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.json({
        success: false,
        msg: 'Username already exists.'
      });
    }

    // Create new user
    let newUser = new User({
      username: req.body.username,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      weight: req.body.weight
    });

    // Save user to database
    await newUser.save();
    
    res.json({
      success: true,
      msg: 'Successfully created new user.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: 'An error occurred while creating the user.',
      error: err.message
    });
  }
});

// Login route with async/await
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(401).send({
        success: false,
        msg: 'Authentication failed. User not found.'
      });
    }

    const isMatch = await user.comparePassword(req.body.password);

    if (isMatch) {
      const token = jwt.sign(user.toJSON(), settings.secret);
      res.json({
        success: true,
        token: 'JWT ' + token,
        userId: user._id
      });
    } else {
      res.status(401).send({
        success: false,
        msg: 'Authentication failed. Wrong password.'
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      msg: 'An error occurred during login.',
      error: err.message
    });
  }
});

module.exports = router;