require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const { verifySocketToken } = require('./middleware/auth');
const SocketHandler = require('./services/socketHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Noufi Game Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Noufi Game API',
    version: '1.0.0',
    status: 'Online',
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// Socket.io authentication middleware
io.use(verifySocketToken);

// Initialize socket handler
const socketHandler = new SocketHandler(io);

// Socket.io connection
io.on('connection', (socket) => {
  socketHandler.handleConnection(socket);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║                                          ║
║        🎰 NOUFI GAME SERVER 🎰          ║
║                                          ║
║  Status: ✅ Running                     ║
║  Port: ${PORT}                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                          ║
║  API: http://localhost:${PORT}            ║
║  WebSocket: Active                       ║
║                                          ║
╚══════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
