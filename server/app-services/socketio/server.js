const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Redis = require('ioredis');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3004'],
  credentials: true
}));

// Initialize Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3004'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Redis client for session management
const redis = new Redis({
  host: process.env.REDIS_HOST || 'cici-redis',
  port: process.env.REDIS_PORT || 6379,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null
});

redis.on('connect', () => {
  console.log('Connected to Redis for Socket.IO session management');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  
  // Store connection in Redis
  redis.set(`socket:${socket.id}`, JSON.stringify({
    id: socket.id,
    connectedAt: new Date().toISOString(),
    ip: socket.request.connection.remoteAddress
  }), 'EX', 3600); // Expire in 1 hour

  // Join room functionality
  socket.on('join-room', async (roomData) => {
    const { room, userId } = roomData;
    socket.join(room);
    
    // Store room membership in Redis
    await redis.sadd(`room:${room}:members`, socket.id);
    await redis.set(`socket:${socket.id}:room`, room);
    
    console.log(`[Socket.IO] Client ${socket.id} joined room: ${room}`);
    
    // Notify others in the room
    socket.to(room).emit('user-joined', {
      socketId: socket.id,
      userId: userId,
      room: room,
      timestamp: new Date().toISOString()
    });
  });

  // Message handling
  socket.on('message', async (data) => {
    const { room, message, userId, type = 'text' } = data;
    
    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      userId,
      socketId: socket.id,
      room,
      type,
      timestamp: new Date().toISOString()
    };

    // Store message in Redis
    await redis.lpush(`room:${room}:messages`, JSON.stringify(messageData));
    await redis.ltrim(`room:${room}:messages`, 0, 99); // Keep last 100 messages

    // Broadcast to room
    io.to(room).emit('message', messageData);
    
    console.log(`[Socket.IO] Message sent to room ${room}:`, message.substring(0, 50));
  });

  // Typing indicators
  socket.on('typing-start', (data) => {
    socket.to(data.room).emit('user-typing', {
      socketId: socket.id,
      userId: data.userId,
      room: data.room
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(data.room).emit('user-stopped-typing', {
      socketId: socket.id,
      userId: data.userId,
      room: data.room
    });
  });

  // File sharing events
  socket.on('file-share', async (data) => {
    const { room, fileInfo, userId } = data;
    
    const fileMessage = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'file',
      fileInfo,
      userId,
      socketId: socket.id,
      room,
      timestamp: new Date().toISOString()
    };

    await redis.lpush(`room:${room}:messages`, JSON.stringify(fileMessage));
    io.to(room).emit('file-shared', fileMessage);
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    
    // Get room information
    const room = await redis.get(`socket:${socket.id}:room`);
    
    if (room) {
      // Remove from room membership
      await redis.srem(`room:${room}:members`, socket.id);
      
      // Notify others in the room
      socket.to(room).emit('user-left', {
        socketId: socket.id,
        room: room,
        timestamp: new Date().toISOString()
      });
    }
    
    // Clean up Redis entries
    await redis.del(`socket:${socket.id}`);
    await redis.del(`socket:${socket.id}:room`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'socketio-realtime-server',
    timestamp: new Date().toISOString(),
    connections: io.sockets.sockets.size
  });
});

// API endpoints for room management
app.use(express.json());

app.get('/rooms/:room/members', async (req, res) => {
  try {
    const members = await redis.smembers(`room:${req.params.room}:members`);
    res.json({ room: req.params.room, members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/rooms/:room/messages', async (req, res) => {
  try {
    const messages = await redis.lrange(`room:${req.params.room}:messages`, 0, 49);
    const parsedMessages = messages.map(msg => JSON.parse(msg));
    res.json({ room: req.params.room, messages: parsedMessages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[Socket.IO] Real-time communication server running on port ${PORT}`);
  console.log(`[Socket.IO] Health check: http://localhost:${PORT}/health`);
});
