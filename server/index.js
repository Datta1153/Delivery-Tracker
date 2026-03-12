const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

dotenv.config();

// Disable mongoose command buffering — operations fail immediately if DB not ready
// instead of silently hanging for 30 seconds
mongoose.set('bufferCommands', false);

console.log('1. Env loaded. Connecting to Express...');
const app = express();
const server = http.createServer(app);
console.log('2. Express created');
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan('dev'));

// Global request timeout — no request should ever hang more than 20 seconds
app.use((req, res, next) => {
    res.setTimeout(20000, () => {
        if (!res.headersSent) {
            console.error(`[TIMEOUT] Request timed out: ${req.method} ${req.url}`);
            res.status(503).json({ message: 'Request timed out. Please try again.' });
        }
    });
    next();
});

// Static folder for proof of delivery uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Canary endpoint to verify deployment version (no auth required)
app.get('/api/ping', (req, res) => {
    res.json({ ok: true, version: 'v4-final-fix', time: new Date().toISOString() });
});

// Pass io to routes BEFORE route handlers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/shipments', require('./routes/shipmentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
    app.use(express.static(clientBuildPath));
    app.get(/^(.*)$/, (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

// Socket.io for Real-time Tracking Updates
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_tracking', (trackingId) => {
        socket.join(trackingId);
        console.log(`Socket ${socket.id} joined tracking room ${trackingId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

console.log('5. Connecting to MongoDB...', process.env.MONGODB_URI ? 'URI exists' : 'URI missing');
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // Fail fast if Atlas unreachable (not 30s default)
    socketTimeoutMS: 30000,          // Max time for any single DB operation
    connectTimeoutMS: 10000,         // Max time to establish initial connection
})
    .then(async () => {
        console.log('Connected to MongoDB');

        // Ensure default users exist
        try {
            const User = require('./models/User');

            // Check if admin exists
            const adminUser = await User.findOne({ email: 'admin@logistiq.com' });
            if (!adminUser) {
                await User.create({
                    name: 'System Admin',
                    email: 'admin@logistiq.com',
                    password: 'password123',
                    role: 'ADMIN'
                });
                console.log('Admin user created');
            } else {
                adminUser.password = 'password123';
                await adminUser.save();
                console.log('Admin user password reset');
            }

            // Check if staff exists
            const staffUser = await User.findOne({ email: 'staff@logistiq.com' });
            if (!staffUser) {
                await User.create({
                    name: 'John Delivery',
                    email: 'staff@logistiq.com',
                    password: 'password123',
                    role: 'STAFF'
                });
                console.log('Staff user created');
            } else {
                staffUser.password = 'password123';
                await staffUser.save();
                console.log('Staff user password reset');
            }
        } catch (seedErr) {
            console.error('Error seeding default users:', seedErr);
        }

        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit so Render restarts the process
    });
