// 数据库连接配置
const mongoose = require('mongoose');
const redis = require('redis');
const winston = require('winston');

class DatabaseConfig {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cici_database';
    this.redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || 'redis123'
    };
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/database.log' }),
        new winston.transports.Console()
      ]
    });
  }

  async connectMongoDB() {
    try {
      await mongoose.connect(this.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      this.logger.info('MongoDB connected successfully');
      return true;
    } catch (error) {
      this.logger.error('MongoDB connection failed:', error);
      return false;
    }
  }

  async connectRedis() {
    try {
      this.redisClient = redis.createClient({
        socket: {
          host: this.redisConfig.host,
          port: this.redisConfig.port,
        },
        password: this.redisConfig.password
      });
      
      this.redisClient.on('error', (err) => {
        this.logger.error('Redis connection error:', err);
      });

      this.redisClient.on('connect', () => {
        this.logger.info('Redis connected successfully');
      });

      await this.redisClient.connect();
      return this.redisClient;
    } catch (error) {
      this.logger.error('Redis connection failed:', error);
      return null;
    }
  }

  async disconnect() {
    try {
      // 关闭MongoDB连接
      await mongoose.disconnect();
      this.logger.info('MongoDB disconnected');

      // 关闭Redis连接
      if (this.redisClient) {
        await this.redisClient.quit();
        this.logger.info('Redis disconnected');
      }
    } catch (error) {
      this.logger.error('Error during disconnection:', error);
    }
  }

  getRedisClient() {
    return this.redisClient;
  }
}

module.exports = DatabaseConfig;
