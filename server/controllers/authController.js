const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/mailer');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            // Block login if the customer hasn't verified their email via OTP
            if (user.role === 'CUSTOMER' && !user.isVerified) {
                return res.status(403).json({ message: 'Please complete OTP verification before logging in', needsVerification: true });
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Register a new user (Admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const userRole = role === 'ADMIN' ? 'ADMIN' : 'STAFF';

        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all staff
// @route   GET /api/auth/staff
// @access  Private/Admin
const getStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: 'STAFF' }).select('-password');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a staff member
// @route   DELETE /api/auth/staff/:id
// @access  Private/Admin
const deleteStaff = async (req, res) => {
    try {
        const staff = await User.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        // Security check: Only allow deleting users with the STAFF role
        if (staff.role !== 'STAFF') {
            return res.status(403).json({ message: 'Cannot delete admin users through this endpoint' });
        }

        await User.deleteOne({ _id: staff._id });

        res.json({ message: 'Staff member removed successfully' });
    } catch (error) {
        console.error('Delete Staff Error:', error);
        res.status(500).json({ message: 'Server error deleting staff member' });
    }
};

// @desc    Register a Customer and Send OTP
// @route   POST /api/auth/customer/register
// @access  Public
const registerCustomer = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash the OTP before storing it to the database for security
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        // OTP expires in 10 minutes
        const otpExpire = Date.now() + 10 * 60 * 1000;

        const user = await User.create({
            name,
            email,
            password,
            role: 'CUSTOMER',
            isVerified: false,
            otpToken: hashedOtp,
            otpTokenExpire: otpExpire
        });

        // Send OTP via Email (fire-and-forget — respond immediately so Render doesn't time out)
        const emailMessage = `
            <h2>Welcome to Logistiq!</h2>
            <p>Your one-time password (OTP) to activate your account is: <strong>${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
        `;

        // Respond immediately so the client gets a fast response
        res.status(201).json({
            message: 'Registration successful. Please check your email for the OTP.',
            email: user.email
        });

        // Send email in background — failures won't affect the user-facing response
        setImmediate(() => {
            sendEmail({
                email: user.email,
                subject: 'Logistiq - Verify Your Email (OTP)',
                html: emailMessage
            }).catch(emailError => {
                console.error('Failed to send OTP Email:', emailError);
            });
        });

    } catch (error) {
        console.error('Register Customer Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Verify OTP for Customer Activation
// @route   POST /api/auth/customer/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        // Hash the incoming OTP to compare with the database
        const hashedIncomingOtp = crypto.createHash('sha256').update(otp).digest('hex');

        if (user.otpToken !== hashedIncomingOtp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpTokenExpire < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // OTP is valid and hasn't expired. Mark user as verified.
        user.isVerified = true;
        user.otpToken = undefined;
        user.otpTokenExpire = undefined;
        await user.save();

        // Log the user in
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            message: 'Email verified successfully! Logging you in...'
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

module.exports = {
    loginUser,
    registerUser,
    getStaff,
    deleteStaff,
    registerCustomer,
    verifyOTP
};
