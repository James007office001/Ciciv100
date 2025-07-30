const express = require('express');

class CacheService {
  constructor() {
    this.router = express.Router();
    this.client = null;
    this.setupRoutes();
  }

  setClient(redisClient) {
    this.client = redisClient;
    console.log('✅ Redis客户端已设置到缓存服务');
  }

  setupRoutes() {
    // 缓存测试端点
    this.router.get('/test/ping', async (req, res) => {
      try {
        if (!this.client) {
          return res.status(503).json({ 
            success: false,
            error: 'Redis服务不可用' 
          });
        }

        const result = await this.client.ping();
        
        res.json({
          success: true,
          message: 'Redis连接正常',
          result: result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Redis连接测试错误:', error);
        res.status(500).json({ 
          success: false,
          error: 'Redis连接失败', 
          details: error.message 
        });
      }
    });

    // 设置缓存
    this.router.post('/:key', async (req, res) => {
      try {
        if (!this.client) {
          return res.status(503).json({ 
            success: false,
            error: 'Redis服务不可用' 
          });
        }

        const { key } = req.params;
        const { value, ttl = 3600 } = req.body; // 默认1小时过期

        const result = await this.client.setEx(key, ttl, JSON.stringify(value));
        
        res.json({
          success: true,
          message: '缓存设置成功',
          key: key,
          ttl: ttl,
          result: result
        });
      } catch (error) {
        console.error('设置缓存错误:', error);
        res.status(500).json({ 
          success: false,
          error: '设置缓存失败', 
          details: error.message 
        });
      }
    });

    // 获取缓存
    this.router.get('/:key', async (req, res) => {
      try {
        if (!this.client) {
          return res.status(503).json({ 
            success: false,
            error: 'Redis服务不可用' 
          });
        }

        const { key } = req.params;
        const value = await this.client.get(key);
        
        if (value === null) {
          return res.status(404).json({ 
            success: false,
            error: '缓存不存在', 
            key: key 
          });
        }

        res.json({
          success: true,
          key: key,
          value: JSON.parse(value),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('获取缓存错误:', error);
        res.status(500).json({ 
          success: false,
          error: '获取缓存失败', 
          details: error.message 
        });
      }
    });

    // 缓存统计
    this.router.get('/stats/info', async (req, res) => {
      try {
        if (!this.client) {
          return res.status(503).json({ 
            success: false,
            error: 'Redis服务不可用' 
          });
        }

        const dbsize = await this.client.dbSize();
        
        res.json({
          success: true,
          connected: true,
          dbsize: dbsize,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('获取缓存统计错误:', error);
        res.status(500).json({ 
          success: false,
          error: '获取统计信息失败', 
          details: error.message 
        });
      }
    });
  }

  // 工具方法：设置缓存
  async set(key, value, ttl = 3600) {
    if (!this.client) {
      throw new Error('Redis客户端未初始化');
    }
    
    return await this.client.setEx(key, ttl, JSON.stringify(value));
  }

  // 工具方法：获取缓存
  async get(key) {
    if (!this.client) {
      throw new Error('Redis客户端未初始化');
    }
    
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  // 工具方法：删除缓存
  async delete(key) {
    if (!this.client) {
      throw new Error('Redis客户端未初始化');
    }
    
    return await this.client.del(key);
  }
}

module.exports = new CacheService();