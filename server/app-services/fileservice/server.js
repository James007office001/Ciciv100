const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const cors = require('cors');

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3004'],
  credentials: true
}));

app.use(express.json());

// Ensure upload directories exist
const uploadDirs = ['/app/uploads', '/app/uploads/images', '/app/uploads/videos', '/app/uploads/documents', '/app/temp'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '/app/uploads/';
    
    // Organize files by type
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/';
    } else {
      uploadPath += 'documents/';
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Serve static files
app.use('/uploads', express.static('/app/uploads'));

// Single file upload
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    const fileInfo = {
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path.replace('/app', ''),
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    };

    console.log(`[File Service] File uploaded: ${req.file.filename} (${req.file.size} bytes)`);
    res.json(fileInfo);
  } catch (error) {
    console.error('[File Service] Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Multiple files upload
app.post('/upload-multiple', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No files uploaded' 
      });
    }

    const filesInfo = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path.replace('/app', ''),
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString()
    }));

    console.log(`[File Service] Multiple files uploaded: ${req.files.length} files`);
    res.json({
      success: true,
      files: filesInfo,
      count: req.files.length
    });
  } catch (error) {
    console.error('[File Service] Multiple upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// File info endpoint
app.get('/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const possiblePaths = [
      `/app/uploads/images/${filename}`,
      `/app/uploads/videos/${filename}`,
      `/app/uploads/documents/${filename}`
    ];

    let filePath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }

    const stats = fs.statSync(filePath);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    res.json({
      success: true,
      filename,
      path: filePath.replace('/app', ''),
      size: stats.size,
      mimeType,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    });
  } catch (error) {
    console.error('[File Service] File info error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete file endpoint
app.delete('/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const possiblePaths = [
      `/app/uploads/images/${filename}`,
      `/app/uploads/videos/${filename}`,
      `/app/uploads/documents/${filename}`
    ];

    let filePath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }

    fs.unlinkSync(filePath);
    console.log(`[File Service] File deleted: ${filename}`);
    
    res.json({
      success: true,
      message: 'File deleted successfully',
      filename
    });
  } catch (error) {
    console.error('[File Service] Delete error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// List files endpoint
app.get('/files', (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    let searchDir = '/app/uploads/';
    
    if (type === 'images') searchDir += 'images/';
    else if (type === 'videos') searchDir += 'videos/';
    else if (type === 'documents') searchDir += 'documents/';

    const files = [];
    
    const scanDirectory = (dir) => {
      if (fs.existsSync(dir)) {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stats = fs.statSync(fullPath);
          
          if (stats.isFile()) {
            files.push({
              filename: item,
              path: fullPath.replace('/app', ''),
              size: stats.size,
              mimeType: mime.lookup(fullPath) || 'application/octet-stream',
              createdAt: stats.birthtime,
              modifiedAt: stats.mtime
            });
          }
        });
      }
    };

    if (type) {
      scanDirectory(searchDir);
    } else {
      scanDirectory('/app/uploads/images/');
      scanDirectory('/app/uploads/videos/');
      scanDirectory('/app/uploads/documents/');
    }

    // Sort by creation date (newest first) and limit
    files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const limitedFiles = files.slice(0, parseInt(limit));

    res.json({
      success: true,
      files: limitedFiles,
      total: files.length,
      returned: limitedFiles.length
    });
  } catch (error) {
    console.error('[File Service] List files error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const uploadStats = {
    images: fs.existsSync('/app/uploads/images/') ? fs.readdirSync('/app/uploads/images/').length : 0,
    videos: fs.existsSync('/app/uploads/videos/') ? fs.readdirSync('/app/uploads/videos/').length : 0,
    documents: fs.existsSync('/app/uploads/documents/') ? fs.readdirSync('/app/uploads/documents/').length : 0
  };

  res.json({
    status: 'healthy',
    service: 'file-processing-service',
    timestamp: new Date().toISOString(),
    uploadStats
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large (max 50MB)'
      });
    }
  }
  
  console.error('[File Service] Error:', error);
  res.status(500).json({
    success: false,
    error: error.message
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`[File Service] File processing service running on port ${PORT}`);
  console.log(`[File Service] Health check: http://localhost:${PORT}/health`);
});
