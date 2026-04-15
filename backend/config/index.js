const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 大模型配置
const modelConfigs = {
  qianwen: {
    apiKey: process.env.QIANWEN_API_KEY,
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
  },
  doubao: {
    apiKey: process.env.DOUBAO_API_KEY,
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
  },
  zhipu: {
    apiKey: process.env.ZHIPU_API_KEY,
    endpoint: 'https://open.bigmodel.cn/api/mcp/v1/chat/completions'
  },
  minimax: {
    apiKey: process.env.MINIMAX_API_KEY,
    endpoint: 'https://api.minimax.chat/v1/text/chatcompletion_pro'
  }
};

// 服务器配置
const serverConfig = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development'
};

module.exports = {
  modelConfigs,
  serverConfig
};