import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { validationResult } from 'express-validator';
import { sendEmail } from '../utils/sendEmail.js';
import { emailTemplates } from '../utils/emailTemplates.js';

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach(error => {
      fieldErrors[error.param] = error.msg;
    });
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: fieldErrors 
    });
  }

  try {
    const { name, email, password, phone } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      phone,
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    // Send welcome email
    try {
      const appUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const emailTemplate = emailTemplates.welcomeEmail(user.name, appUrl);
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });
    } catch (mailErr) {
      console.error('Failed to send welcome email:', mailErr);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach(error => {
      fieldErrors[error.param] = error.msg;
    });
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: fieldErrors 
    });
  }

  try {
    let { email, password } = req.body;
    email = email.toLowerCase();

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { register, login, getProfile };

const createStaff = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    user = new User({ name, email, password, phone, role: 'staff' });
    await user.save();

    res.status(201).json({ success: true, message: 'Staff created', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createStaff };
