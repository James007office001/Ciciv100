const express = require('express');
const multer = require('multer');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

class FileService {
  constructor() {
    this.router = express.Router();
    this.setupMulter();
    this.setupRoutes();
  }

  setupMulter() {
    // 文件存储配置
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        
        if (file.mimetype.startsWith('image/')) {
          uploadPath += 'images/';
        } else if (file.mimetype.startsWith('video/')) {
          uploadPath += 'videos/';
        } else {
          uploadPath += 'documents/';
        }
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const hash = crypto.createHash('md5').update(file.originalname + uniqueSuffix).digest('hex').substr(0, 8);
        const ext = path.extname(file.originalname);
        cb(null, `${hash}-${uniqueSuffix}${ext}`);
      }
    });

    // 文件过滤器
    const fileFilter = (req, file, cb) => {
      const allowedTypes = {
        'image/jpeg': true,
        'image/png': true,
        'image/gif': true,
        'image/webp': true,
        'video/mp4': true,
        'video/mpeg': true,
        'video/quicktime': true,
        'application/pdf': true,
        'text/plain': true
      };

      if (allowedTypes[file.mimetype]) {
        cb(null, true);
      } else {
        cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
      }
    };

    this.upload = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
      }
    });
  }

  setupRoutes() {
    // 图片上传
    this.router.post('/image', this.upload.single('image'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: '没有上传文件' });
        }

        const imageInfo = await this.processImage(req.file);
        
        res.json({
          success: true,
          message: '图片上传成功',
          file: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: `/uploads/images/${req.file.filename}`,
            ...imageInfo
          }
        });
      } catch (error) {
        console.error('图片上传错误:', error);
        res.status(500).json({ 
          success: false,
          error: '图片上传失败', 
          details: error.message 
        });
      }
    });

    // 文档上传
    this.router.post('/document', this.upload.single('document'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: '没有上传文件' });
        }

        res.json({
          success: true,
          message: '文档上传成功',
          file: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: `/uploads/documents/${req.file.filename}`
          }
        });
      } catch (error) {
        console.error('文档上传错误:', error);
        res.status(500).json({ 
          success: false,
          error: '文档上传失败', 
          details: error.message 
        });
      }
    });

    // 上传测试端点
    this.router.post('/test', (req, res) => {
      res.json({
        success: true,
        message: '文件上传服务正常工作',
        endpoints: {
          image: 'POST /api/upload/image',
          document: 'POST /api/upload/document',
          info: 'GET /api/upload/info/:filename'
        },
        timestamp: new Date().toISOString()
      });
    });

    // 文件信息查询
    this.router.get('/info/:filename', async (req, res) => {
      try {
        const { filename } = req.params;
        const filePath = await this.findFile(filename);
        
        if (!filePath) {
          return res.status(404).json({ 
            success: false,
            error: '文件不存在' 
          });
        }

        const stats = await fs.stat(filePath);
        const fileInfo = {
          filename: filename,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          path: `/uploads/${path.basename(path.dirname(filePath))}/${filename}`
        };

        res.json({
          success: true,
          file: fileInfo
        });
      } catch (error) {
        console.error('文件信息查询错误:', error);
        res.status(500).json({ 
          success: false,
          error: '查询失败', 
          details: error.message 
        });
      }
    });
  }

  async processImage(file) {
    try {
      const image = await Jimp.read(file.path);
      const { width, height } = image.bitmap;

      // 生成缩略图 (最大200x200)
      const thumbnail = image.clone();
      thumbnail.scaleToFit(200, 200);
      
      const thumbnailPath = file.path.replace(/(\.[^.]+)$/, '_thumb$1');
      await thumbnail.writeAsync(thumbnailPath);

      return {
        dimensions: { width, height },
        thumbnail: thumbnailPath.replace(/^.*[\\\/]uploads[\\\/]/, '/uploads/'),
        processed: true
      };
    } catch (error) {
      console.error('图片处理错误:', error);
      return { processed: false };
    }
  }

  async findFile(filename) {
    const searchPaths = [
      `uploads/images/${filename}`,
      `uploads/videos/${filename}`,
      `uploads/documents/${filename}`
    ];

    for (const searchPath of searchPaths) {
      try {
        await fs.access(searchPath);
        return searchPath;
      } catch (err) {
        continue;
      }
    }

    return null;
  }
}

module.exports = new FileService();