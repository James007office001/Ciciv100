const express = require('express');
const Redis = require('ioredis');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Security and optimization middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'cici-redis',
  port: process.env.REDIS_PORT || 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

// Redis connection event handlers
redis.on('connect', () => {
  console.log('[Cache Service] Connected to Redis');
});

redis.on('error', (err) => {
  console.error('[Cache Service] Redis connection error:', err);
});

redis.on('ready', () => {
  console.log('[Cache Service] Redis connection ready');
});

// Cache operations

// Set cache value
app.post('/cache/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, ttl = 3600 } = req.body; // Default TTL: 1 hour

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Value is required'
      });
    }

    const serializedValue = JSON.stringify(value);
    
    if (ttl > 0) {
      await redis.setex(key, ttl, serializedValue);
    } else {
      await redis.set(key, serializedValue);
    }

    console.log(`[Cache Service] Set cache key: ${key} (TTL: ${ttl}s)`);
    res.json({
      success: true,
      message: 'Cache set successfully',
      key,
      ttl: ttl > 0 ? ttl : null
    });
  } catch (error) {
    console.error('[Cache Service] Set cache error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get cache value
app.get('/cache/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await redis.get(key);

    if (value === null) {
      return res.status(404).json({
        success: false,
        error: 'Key not found',
        key
      });
    }

    const parsedValue = JSON.parse(value);
    const ttl = await redis.ttl(key);

    console.log(`[Cache Service] Retrieved cache key: ${key}`);
    res.json({
      success: true,
      key,
      value: parsedValue,
      ttl: ttl > 0 ? ttl : null
    });
  } catch (error) {
    console.error('[Cache Service] Get cache error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete cache value
app.delete('/cache/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await redis.del(key);

    console.log(`[Cache Service] Deleted cache key: ${key}`);
    res.json({
      success: true,
      message: result > 0 ? 'Key deleted successfully' : 'Key not found',
      key,
      deleted: result > 0
    });
  } catch (error) {
    console.error('[Cache Service] Delete cache error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear all cache with pattern
app.delete('/cache', async (req, res) => {
  try {
    const { pattern = '*' } = req.query;
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      return res.json({
        success: true,
        message: 'No keys found to delete',
        deleted: 0
      });
    }

    const result = await redis.del(...keys);
    console.log(`[Cache Service] Cleared ${result} cache keys with pattern: ${pattern}`);
    
    res.json({
      success: true,
      message: `Deleted ${result} cache keys`,
      pattern,
      deleted: result
    });
  } catch (error) {
    console.error('[Cache Service] Clear cache error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Session management

// Create session
app.post('/session', async (req, res) => {
  try {
    const { userId, data = {}, ttl = 86400 } = req.body; // Default TTL: 24 hours
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const sessionId = uuidv4();
    const sessionKey = `session:${sessionId}`;
    const sessionData = {
      sessionId,
      userId,
      data,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    };

    await redis.setex(sessionKey, ttl, JSON.stringify(sessionData));

    console.log(`[Cache Service] Created session: ${sessionId} for user: ${userId}`);
    res.json({
      success: true,
      sessionId,
      userId,
      ttl
    });
  } catch (error) {
    console.error('[Cache Service] Create session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get session
app.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionKey = `session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired'
      });
    }

    const parsedSession = JSON.parse(sessionData);
    
    // Update last accessed time
    parsedSession.lastAccessedAt = new Date().toISOString();
    const ttl = await redis.ttl(sessionKey);
    await redis.setex(sessionKey, ttl > 0 ? ttl : 86400, JSON.stringify(parsedSession));

    console.log(`[Cache Service] Retrieved session: ${sessionId}`);
    res.json({
      success: true,
      session: parsedSession,
      ttl: ttl > 0 ? ttl : null
    });
  } catch (error) {
    console.error('[Cache Service] Get session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update session
app.put('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { data } = req.body;
    const sessionKey = `session:${sessionId}`;
    
    const existingData = await redis.get(sessionKey);
    if (!existingData) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired'
      });
    }

    const sessionData = JSON.parse(existingData);
    sessionData.data = { ...sessionData.data, ...data };
    sessionData.lastAccessedAt = new Date().toISOString();

    const ttl = await redis.ttl(sessionKey);
    await redis.setex(sessionKey, ttl > 0 ? ttl : 86400, JSON.stringify(sessionData));

    console.log(`[Cache Service] Updated session: ${sessionId}`);
    res.json({
      success: true,
      sessionId,
      session: sessionData
    });
  } catch (error) {
    console.error('[Cache Service] Update session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete session
app.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionKey = `session:${sessionId}`;
    const result = await redis.del(sessionKey);

    console.log(`[Cache Service] Deleted session: ${sessionId}`);
    res.json({
      success: true,
      message: result > 0 ? 'Session deleted successfully' : 'Session not found',
      sessionId,
      deleted: result > 0
    });
  } catch (error) {
    console.error('[Cache Service] Delete session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cache analytics and management

// Get cache statistics
app.get('/stats', async (req, res) => {
  try {
    const info = await redis.info('memory');
    const keyCount = await redis.dbsize();
    const sessions = await redis.keys('session:*');

    const memoryUsage = info.split('\n')
      .filter(line => line.includes('used_memory_human'))
      .map(line => line.split(':')[1]?.trim())[0];

    res.json({
      success: true,
      stats: {
        totalKeys: keyCount,
        sessionCount: sessions.length,
        memoryUsage: memoryUsage || 'Unknown',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Cache Service] Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List all cache keys
app.get('/keys', async (req, res) => {
  try {
    const { pattern = '*', limit = 100 } = req.query;
    const keys = await redis.keys(pattern);
    
    const limitedKeys = keys.slice(0, parseInt(limit));
    const keyInfo = await Promise.all(
      limitedKeys.map(async (key) => {
        const ttl = await redis.ttl(key);
        const type = await redis.type(key);
        return {
          key,
          type,
          ttl: ttl > 0 ? ttl : null
        };
      })
    );

    res.json({
      success: true,
      keys: keyInfo,
      total: keys.length,
      returned: limitedKeys.length
    });
  } catch (error) {
    console.error('[Cache Service] List keys error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await redis.ping();
    const keyCount = await redis.dbsize();
    
    res.json({
      status: 'healthy',
      service: 'cache-management-service',
      timestamp: new Date().toISOString(),
      redis: {
        connected: redis.status === 'ready',
        totalKeys: keyCount
      }
    });
  } catch (error) {
    console.error('[Cache Service] Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'cache-management-service',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Cache Service] Received SIGTERM, shutting down gracefully');
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Cache Service] Received SIGINT, shutting down gracefully');
  await redis.quit();
  process.exit(0);
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`[Cache Service] Cache management service running on port ${PORT}`);
  console.log(`[Cache Service] Health check: http://localhost:${PORT}/health`);
});
