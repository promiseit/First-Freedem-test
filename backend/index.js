const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const ModelManager = require('./models/modelManager');
const { serverConfig } = require('./config');

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 文件解析函数
async function parseFile(filePath, fileName) {
  const ext = path.extname(fileName).toLowerCase();
  
  try {
    switch (ext) {
      case '.pdf':
        const pdfData = await pdf(fs.readFileSync(filePath));
        return pdfData.text;
      case '.doc':
      case '.docx':
        const wordData = await mammoth.extractRawText({ path: filePath });
        return wordData.value;
      case '.xls':
      case '.xlsx':
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_csv(worksheet);
      case '.txt':
        return fs.readFileSync(filePath, 'utf8');
      default:
        throw new Error('Unsupported file format');
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    throw error;
  }
}

// 配置multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件类型验证
const fileFilter = (req, file, cb) => {
  // 图片类型验证
  if (req.url === '/api/upload/image') {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type'), false);
    }
  }
  // 文件类型验证
  else if (req.url === '/api/upload/file') {
    const allowedFileTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
  else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// 创建Express应用
const app = express();
const PORT = serverConfig.port;

// 中间件
app.use(cors({
  origin: '*', // 在生产环境中应该设置具体的域名
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({
  limit: '1mb' // 限制JSON请求大小
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '1mb' // 限制URL编码请求大小
}));

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 静态文件服务，添加安全头
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }
}));

// 路由
app.post('/api/message', async (req, res) => {
  const { content, apiKeys } = req.body;
  console.log('Received message:', content);
  console.log('Received apiKeys:', apiKeys);
  
  try {
    // 创建模型管理器实例，使用前端发送的API密钥
    const modelManager = new ModelManager(apiKeys);
    
    // 设置3秒超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 3000);
    });
    
    // 调用大模型进行深度思考
    const modelPromise = modelManager.deepThink(content);
    
    // 等待第一个完成的Promise
    const response = await Promise.race([modelPromise, timeoutPromise]);
    
    res.json({
      success: true,
      message: response
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.json({
      success: true,
      message: '感谢您的咨询。我正在分析您的问题，请注意防范潜在风险。在做出任何投资决策前，请务必充分了解相关信息，避免盲目跟风。'
    });
  }
});

app.post('/api/upload/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  console.log('Received image:', req.file.filename);
  
  try {
    // 获取API密钥
    const apiKeys = req.body.apiKeys ? JSON.parse(req.body.apiKeys) : {};
    console.log('Received apiKeys:', apiKeys);
    
    // 创建模型管理器实例，使用前端发送的API密钥
    const modelManager = new ModelManager(apiKeys);
    
    // 使用Tesseract进行OCR
    const { data: { text } } = await Tesseract.recognize(
      req.file.path,
      'chi_sim',
      {
        logger: info => console.log(info)
      }
    );
    
    console.log('Extracted text from image:', text);
    
    // 调用大模型进行分析
    const response = await modelManager.deepThink(text);
    
    res.json({
      success: true,
      message: response
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.json({
      success: true,
      message: '我已收到您上传的图片，正在分析其中的内容。请稍候...'
    });
  }
});

app.post('/api/upload/file', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  console.log('Received file:', req.file.filename);
  
  try {
    // 获取API密钥
    const apiKeys = req.body.apiKeys ? JSON.parse(req.body.apiKeys) : {};
    console.log('Received apiKeys:', apiKeys);
    
    // 创建模型管理器实例，使用前端发送的API密钥
    const modelManager = new ModelManager(apiKeys);
    
    // 解析文件
    const fileContent = await parseFile(req.file.path, req.file.originalname);
    console.log('Extracted content from file:', fileContent.substring(0, 500) + '...');
    
    // 调用大模型进行分析
    const response = await modelManager.deepThink(fileContent);
    
    res.json({
      success: true,
      message: response
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.json({
      success: true,
      message: `我已收到您上传的文件 ${req.file.originalname}，正在分析其中的内容。请稍候...`
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // 处理文件上传错误
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, message: 'File too large' });
    }
    return res.status(400).json({ success: false, message: 'File upload error' });
  }
  
  // 处理文件类型错误
  if (err.message === 'Invalid image type' || err.message === 'Invalid file type') {
    return res.status(400).json({ success: false, message: err.message });
  }
  
  // 处理其他错误
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;