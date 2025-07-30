const jwt = require('jsonwebtoken');

class SocketService {
  constructor() {
    this.connectedUsers = new Map();
    this.rooms = new Map();
    this.io = null;
  }

  initialize(io) {
    this.io = io;
    console.log('🔌 初始化 Socket.IO 服务...');

    // JWT认证中间件
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        // 开发阶段允许无token连接
        socket.userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        return next();
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cici-super-secret-jwt-key-2025');
        socket.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('认证失败'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`🔌 用户连接: ${socket.userId} (${socket.id})`);
      
      // 存储用户连接信息
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        connectTime: new Date(),
        status: 'online'
      });

      // 注册事件处理器
      this.registerEventHandlers(socket);

      // 连接确认
      socket.emit('connected', {
        userId: socket.userId,
        message: '连接成功',
        timestamp: new Date().toISOString(),
        onlineUsers: this.getOnlineUsersCount()
      });
    });

    console.log('✅ Socket.IO 事件监听器已注册');
  }

  registerEventHandlers(socket) {
    // 用户状态管理
    socket.on('user:status', (data) => {
      console.log(`用户状态更新: ${socket.userId} -> ${data.status}`);
      
      if (this.connectedUsers.has(socket.userId)) {
        this.connectedUsers.get(socket.userId).status = data.status;
      }

      // 广播状态更新
      socket.broadcast.emit('user:status:update', {
        userId: socket.userId,
        status: data.status,
        timestamp: new Date().toISOString()
      });
    });

    // 聊天功能
    socket.on('chat:join', (roomId) => {
      socket.join(roomId);
      
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set());
      }
      this.rooms.get(roomId).add(socket.userId);

      console.log(`用户 ${socket.userId} 加入聊天室 ${roomId}`);
      
      socket.to(roomId).emit('chat:user:joined', {
        userId: socket.userId,
        roomId: roomId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('chat:message', (data) => {
      const { roomId, message, type = 'text' } = data;
      
      const messageData = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: socket.userId,
        message: message,
        type: type,
        roomId: roomId,
        timestamp: new Date().toISOString()
      };

      // 发送给房间内的所有用户
      this.io.to(roomId).emit('chat:message', messageData);
      
      console.log(`聊天消息: ${socket.userId} -> ${roomId}: ${message}`);
    });

    // 活动相关事件
    socket.on('activity:join-live', (activityId) => {
      const liveRoom = `activity_live_${activityId}`;
      socket.join(liveRoom);
      
      console.log(`用户 ${socket.userId} 加入活动直播 ${activityId}`);
      
      socket.to(liveRoom).emit('activity:user:joined-live', {
        userId: socket.userId,
        activityId: activityId,
        timestamp: new Date().toISOString()
      });
    });

    // 心跳检测
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // 断开连接处理
    socket.on('disconnect', (reason) => {
      console.log(`🔌 用户断开连接: ${socket.userId} (${reason})`);
      
      // 清理用户连接信息
      this.connectedUsers.delete(socket.userId);
      
      // 从所有房间中移除用户
      this.rooms.forEach((users, roomId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          socket.to(roomId).emit('chat:user:left', {
            userId: socket.userId,
            roomId: roomId,
            timestamp: new Date().toISOString()
          });
        }
      });

      // 广播用户离线状态
      socket.broadcast.emit('user:status:update', {
        userId: socket.userId,
        status: 'offline',
        timestamp: new Date().toISOString()
      });
    });
  }

  // 获取在线用户数量
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  // 获取在线用户列表
  getOnlineUsers() {
    return Array.from(this.connectedUsers.entries()).map(([userId, info]) => ({
      userId,
      status: info.status,
      connectTime: info.connectTime
    }));
  }

  // 向特定用户发送消息
  sendToUser(userId, event, data) {
    const userInfo = this.connectedUsers.get(userId);
    if (userInfo && this.io) {
      this.io.to(userInfo.socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // 向房间发送消息
  sendToRoom(roomId, event, data) {
    if (this.io) {
      this.io.to(roomId).emit(event, data);
    }
  }

  // 广播消息给所有连接的用户
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

module.exports = new SocketService();