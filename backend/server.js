import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Debug from 'debug';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler } from './middleware/error.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// security middlewares
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  trustProxy: true,
});
app.use(limiter);

// logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// serve proof-of-delivery files
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/track', trackRoutes); // public tracking lookup
app.use('/api/reports', reportRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Swagger API docs
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Delivery Tracker API',
      version: '1.0.0',
      description: 'API documentation for the delivery tracking application',
    },
    servers: [
      { url: process.env.API_URL || 'http://localhost:5000/api' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js', './models/*.js'], // files containing annotations
};
const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  const debug = Debug('app:socket');
  debug('New client connected: %s', socket.id);

  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    debug('User %s joined room', userId);
  });

  socket.on('package-update', (data) => {
    const { packageId, status, location, userId } = data;
    io.to(`user-${userId}`).emit('package-updated', {
      packageId,
      status,
      location,
      timestamp: new Date(),
    });
    debug('Package %s updated to %s', packageId, status);
  });

  socket.on('disconnect', () => {
    debug('Client disconnected: %s', socket.id);
  });
});

// global error handler (should be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  const debug = Debug('app:server');
  debug('Server running on port %d', PORT);
});

export { io };
