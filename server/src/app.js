const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// 导入服务
const DatabaseConfig = require('./config/database');
const socketService = require('./services/socketService');
const fileService = require('./services/fileService');
const cacheService = require('./services/cacheService');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

class CICIServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.port = process.env.PORT || 3000;
    this.db = new DatabaseConfig();
  }

  async initializeMiddleware() {
    console.log('🔧 初始化中间件...');
    
    // 安全中间件
    this.app.use(helmet());
    this.app.use(cors({
      origin: true,
      credentials: true
    }));
    this.app.use(compression());

    // 请求日志
    this.app.use(morgan('combined'));

    // 限流中间件
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100 // 限制每个IP 15分钟内最多100个请求
    });
    this.app.use('/api', limiter);

    // 解析请求体
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 静态文件服务
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    
    console.log('✅ 中间件初始化完成');
  }

  async initializeDatabase() {
    console.log('🔗 初始化数据库连接...');
    
    const mongoConnected = await this.db.connectMongoDB();
    if (!mongoConnected) {
      console.warn('⚠️ MongoDB连接失败，部分功能可能不可用');
    }
    
    const redisClient = await this.db.connectRedis();
    if (redisClient) {
      // 将Redis客户端传递给缓存服务
      cacheService.setClient(redisClient);
      console.log('✅ 缓存服务已连接Redis');
    } else {
      console.warn('⚠️ Redis连接失败，缓存功能不可用');
    }
    
    console.log('✅ 数据库初始化完成');
  }

  initializeRoutes() {
    console.log('🛣️ 初始化路由...');

    // 健康检查
    this.app.get('/health', async (req, res) => {
      try {
        const dbStatus = await this.db.testConnections();
        const onlineUsers = socketService.getOnlineUsersCount();
        
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: dbStatus,
          socketio: {
            connected: true,
            onlineUsers: onlineUsers
          },
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // API信息
    this.app.get('/api/info', (req, res) => {
      res.json({
        name: 'CICI Server',
        version: '1.0.0',
        description: '综合社交活动平台后端服务',
        features: [
          'Express Server',
          'Socket.IO Real-time Communication',
          'File Upload Service',
          'Redis Cache Layer',
          'MongoDB Database',
          'JWT Authentication',
          'User Management',
          'Family Group Management'
        ],
        endpoints: {
          health: 'GET /health',
          info: 'GET /api/info',
          auth: 'POST /api/auth/*',
          users: 'GET/PUT /api/users/*',
          socketTest: 'GET /api/socket/test',
          upload: 'POST /api/upload/*',
          cache: 'GET /api/cache/*'
        },
        timestamp: new Date().toISOString()
      });
    });

    // Socket.IO 测试
    this.app.get('/api/socket/test', (req, res) => {
      const onlineUsers = socketService.getOnlineUsersCount();
      const testMessage = {
        message: 'Socket.IO服务正常工作',
        timestamp: new Date().toISOString(),
        onlineUsers: onlineUsers,
        testId: `test_${Date.now()}`
      };
      
      // 向所有连接的客户端发送测试消息
      socketService.broadcast('server-test', testMessage);
      
      res.json({
        success: true,
        message: '测试消息已广播',
        data: testMessage,
        socketStats: {
          onlineUsers: onlineUsers,
          status: 'active'
        }
      });
    });

    // Socket.IO 状态
    this.app.get('/api/socket/stats', (req, res) => {
      const onlineUsers = socketService.getOnlineUsers();
      
      res.json({
        success: true,
        stats: {
          totalConnections: socketService.getOnlineUsersCount(),
          onlineUsers: onlineUsers
        },
        timestamp: new Date().toISOString()
      });
    });

    // 认证路由
    this.app.use('/api/auth', authRoutes);

    // 用户管理路由
    this.app.use('/api/users', userRoutes);

    // 文件上传路由
    this.app.use('/api/upload', fileService.router);

    // 缓存管理路由
    this.app.use('/api/cache', cacheService.router);

    // API 根路径
    this.app.get('/api', (req, res) => {
      res.json({
        message: 'CICI API Server',
        version: '1.0.0',
        availableEndpoints: [
          'GET /health - 健康检查',
          'GET /api/info - API信息',
          'POST /api/auth/register - 用户注册',
          'POST /api/auth/login - 用户登录',
          'POST /api/auth/oauth/:provider - OAuth登录',
          'GET /api/auth/me - 获取当前用户',
          'GET /api/users/profile - 获取用户资料',
          'PUT /api/users/profile - 更新用户资料',
          'POST /api/users/family-group - 创建家庭群组',
          'GET /api/socket/test - Socket.IO测试',
          'POST /api/upload/image - 图片上传',
          'GET /api/cache/test/ping - 缓存测试'
        ],
        timestamp: new Date().toISOString()
      });
    });

    // 默认根路径
    this.app.get('/', (req, res) => {
      res.json({
        message: '欢迎访问 CICI 综合社交活动平台',
        server: 'CICI Backend Server',
        version: '1.0.0',
        status: 'running',
        features: {
          authentication: '用户认证系统',
          familyGroups: '家庭群组管理',
          realtime: '实时通信',
          fileUpload: '文件上传服务',
          caching: '缓存服务'
        },
        links: {
          health: '/health',
          api: '/api',
          docs: '/api/info'
        },
        timestamp: new Date().toISOString()
      });
    });

    // 404处理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: '请求的资源不存在',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        suggestion: '访问 /api 查看可用端点'
      });
    });

    // 错误处理中间件
    this.app.use((error, req, res, next) => {
      console.error('服务器错误:', error);
      res.status(500).json({
        error: '服务器内部错误',
        code: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    });

    console.log('✅ 路由初始化完成');
  }

  initializeSocketIO() {
    console.log('🔌 初始化Socket.IO服务...');
    socketService.initialize(this.io);
    console.log('✅ Socket.IO服务初始化完成');
  }

  async start() {
    try {
      console.log('🚀 启动CICI应用服务器...');
      
      await this.initializeMiddleware();
      await this.initializeDatabase();
      this.initializeRoutes();
      this.initializeSocketIO();

      this.server.listen(this.port, () => {
        console.log(`✅ 服务器运行在端口 ${this.port}`);
        console.log(`🌐 HTTP: http://localhost:${this.port}`);
        console.log(`🔌 Socket.IO: ws://localhost:${this.port}/socket.io`);
      });

    } catch (error) {
      console.error('❌ 服务器启动失败:', error);
      process.exit(1);
    }
  }
}

// 启动服务器
if (require.main === module) {
  const server = new CICIServer();
  server.start();
}

module.exports = CICIServer;
