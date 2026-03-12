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

console.log('1. Env loaded. Connecting to Express...');
const app = express();
const server = http.createServer(app);
console.log('2. Express created');
const io = new Server(server, {
    cors: {
        origin: '*', // For development, allow all origins
    }
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // For images
app.use(morgan('dev'));

// Static folder for proof of delivery uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/shipments', require('./routes/shipmentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
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

// Pass io to routes so they can emit events
app.use((req, res, next) => {
    req.io = io;
    next();
});

console.log('5. Connecting to MongoDB...', process.env.MONGODB_URI ? 'URI exists' : 'URI missing');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
