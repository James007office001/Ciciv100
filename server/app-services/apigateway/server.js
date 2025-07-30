const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

const app = express();

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Security and optimization middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
});

// Service endpoints configuration
const services = {
  main: {
    target: 'http://localhost:3000',
    name: 'Main CICI Application'
  },
  socketio: {
    target: 'http://localhost:3001',
    name: 'Socket.IO Real-time Service'
  },
  files: {
    target: 'http://localhost:3002',
    name: 'File Processing Service'
  },
  cache: {
    target: 'http://localhost:3003',
    name: 'Cache Management Service'
  }
};

// Proxy configuration options
const createProxy = (target, pathRewrite = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${req.url}: ${err.message}`);
      res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'The requested service is currently not responding',
        timestamp: new Date().toISOString()
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying ${req.method} ${req.url} to ${target}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.debug(`Received response ${proxyRes.statusCode} for ${req.url}`);
    }
  });
};

// API Gateway routes

// Main application routes
app.use('/api/main', createProxy(services.main.target, {
  '^/api/main': ''
}));

// Socket.IO service routes
app.use('/api/realtime', createProxy(services.socketio.target, {
  '^/api/realtime': ''
}));

app.use('/socket.io', createProxy(services.socketio.target));

// File service routes
app.use('/api/files', createProxy(services.files.target, {
  '^/api/files': ''
}));

app.use('/uploads', createProxy(services.files.target));

// Cache service routes
app.use('/api/cache', createProxy(services.cache.target, {
  '^/api/cache': ''
}));

// Service discovery endpoint
app.get('/api/services', (req, res) => {
  const serviceList = Object.entries(services).map(([key, config]) => ({
    id: key,
    name: config.name,
    target: config.target,
    status: 'unknown' // Could be enhanced with actual health checks
  }));

  res.json({
    success: true,
    services: serviceList,
    gateway: {
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// Health check for individual services
app.get('/api/health/:service', async (req, res) => {
  const { service } = req.params;
  
  if (!services[service]) {
    return res.status(404).json({
      success: false,
      error: 'Service not found',
      availableServices: Object.keys(services)
    });
  }

  try {
    const fetch = require('node-fetch');
    const healthUrl = `${services[service].target}/health`;
    
    const response = await fetch(healthUrl, {
      timeout: 5000
    });
    
    const healthData = await response.json();
    
    res.json({
      success: true,
      service,
      health: healthData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Health check failed for ${service}: ${error.message}`);
    res.status(503).json({
      success: false,
      service,
      error: 'Service health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Gateway health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      configured: Object.keys(services).length,
      targets: Object.values(services).map(s => s.target)
    }
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    documentation: {
      title: 'CICI API Gateway',
      version: '1.0.0',
      description: 'Central API Gateway for CICI microservices architecture',
      endpoints: {
        '/api/main/*': 'Main CICI application endpoints',
        '/api/realtime/*': 'Real-time communication via Socket.IO',
        '/socket.io/*': 'Socket.IO direct connection',
        '/api/files/*': 'File upload, processing, and management',
        '/uploads/*': 'Static file serving',
        '/api/cache/*': 'Cache and session management',
        '/api/services': 'Service discovery',
        '/api/health/:service': 'Service health checks',
        '/health': 'Gateway health status',
        '/api/docs': 'This documentation'
      },
      rateLimits: {
        window: '15 minutes',
        maxRequests: 1000,
        perIP: true
      }
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: [
      '/api/main/*',
      '/api/realtime/*',
      '/api/files/*',
      '/api/cache/*',
      '/api/services',
      '/health',
      '/api/docs'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Gateway error: ${err.message}`, { 
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    error: 'Internal gateway error',
    message: 'An unexpected error occurred in the API gateway',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Documentation: http://localhost:${PORT}/api/docs`);
  logger.info(`Configured services: ${Object.keys(services).join(', ')}`);
});
