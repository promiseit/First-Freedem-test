// 大模型API集成服务
import axios from 'axios';

// 模型配置
const MODEL_CONFIGS = {
  // 商业模型
  openai: {
    baseURL: 'https://api.openai.com/v1',
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    timeout: 30000,
    maxRetries: 3
  },
  anthropic: {
    baseURL: 'https://api.anthropic.com/v1',
    apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
    model: 'claude-3-opus-20240229',
    timeout: 30000,
    maxRetries: 3
  },
  // 开源模型
  ollama: {
    baseURL: 'http://localhost:11434/api',
    apiKey: '',
    model: 'llama3',
    timeout: 60000,
    maxRetries: 3
  },
  mistral: {
    baseURL: 'https://api.mistral.ai/v1',
    apiKey: process.env.REACT_APP_MISTRAL_API_KEY,
    model: 'mistral-large-latest',
    timeout: 30000,
    maxRetries: 3
  }
};

// 错误处理类
class LLMError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'LLMError';
    this.code = code;
    this.details = details;
  }
}

// 重试机制
const withRetry = async (fn, maxRetries = 3, delayMs = 1000) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      // 只对网络错误和服务端错误进行重试
      if (error.code === 'ECONNABORTED' || (error.response && error.response.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
};

// 模型API封装类
class LLMService {
  constructor() {
    this.currentModel = 'openai';
    this.clients = {};
    this.initializeClients();
  }

  // 初始化API客户端
  initializeClients() {
    try {
      Object.keys(MODEL_CONFIGS).forEach(model => {
        const config = MODEL_CONFIGS[model];
        this.clients[model] = axios.create({
          baseURL: config.baseURL,
          timeout: config.timeout,
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
          }
        });
      });
    } catch (error) {
      console.error('Failed to initialize LLM clients:', error);
      // 初始化失败时创建空对象，避免应用崩溃
      this.clients = {};
    }
  }

  // 切换模型
  setModel(model) {
    if (!MODEL_CONFIGS[model]) {
      throw new LLMError('Invalid model', 'INVALID_MODEL', { model });
    }
    this.currentModel = model;
    return this.currentModel;
  }

  // 获取当前模型
  getCurrentModel() {
    return this.currentModel;
  }

  // 获取所有可用模型
  getAvailableModels() {
    return Object.keys(MODEL_CONFIGS);
  }

  // 通用聊天方法
  async chat(messages, options = {}) {
    const model = options.model || this.currentModel;
    const config = MODEL_CONFIGS[model];
    const client = this.clients[model];

    if (!client) {
      throw new LLMError('Model not initialized', 'MODEL_NOT_INITIALIZED', { model });
    }

    try {
      const requestFn = async () => {
        switch (model) {
          case 'openai':
            return await this.chatOpenAI(messages, options, client, config);
          case 'anthropic':
            return await this.chatAnthropic(messages, options, client, config);
          case 'ollama':
            return await this.chatOllama(messages, options, client, config);
          case 'mistral':
            return await this.chatMistral(messages, options, client, config);
          default:
            throw new LLMError('Unsupported model', 'UNSUPPORTED_MODEL', { model });
        }
      };

      return await withRetry(requestFn, config.maxRetries);
    } catch (error) {
      this.handleError(error, model);
    }
  }

  // OpenAI API调用
  async chatOpenAI(messages, options, client, config) {
    const response = await client.post('/chat/completions', {
      model: options.model || config.model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      ...options
    });

    return {
      model: response.data.model,
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  }

  // Anthropic API调用
  async chatAnthropic(messages, options, client, config) {
    const response = await client.post('/messages', {
      model: options.model || config.model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      ...options
    });

    return {
      model: response.data.model,
      content: response.data.content[0].text,
      usage: response.data.usage
    };
  }

  // Ollama API调用
  async chatOllama(messages, options, client, config) {
    const response = await client.post('/chat', {
      model: options.model || config.model,
      messages,
      stream: false,
      ...options
    });

    return {
      model: response.data.model,
      content: response.data.message.content,
      usage: null
    };
  }

  // Mistral API调用
  async chatMistral(messages, options, client, config) {
    const response = await client.post('/chat/completions', {
      model: options.model || config.model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      ...options
    });

    return {
      model: response.data.model,
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  }

  // 错误处理
  handleError(error, model) {
    if (error.response) {
      // 服务器返回错误
      const status = error.response.status;
      const data = error.response.data;
      
      let message = 'API请求失败';
      let code = 'API_ERROR';
      
      switch (status) {
        case 401:
          message = 'API密钥无效';
          code = 'UNAUTHORIZED';
          break;
        case 403:
          message = '权限不足';
          code = 'FORBIDDEN';
          break;
        case 429:
          message = '请求过于频繁';
          code = 'RATE_LIMITED';
          break;
        case 500:
          message = '服务器内部错误';
          code = 'SERVER_ERROR';
          break;
        default:
          message = data.error?.message || message;
          code = data.error?.code || code;
      }
      
      throw new LLMError(message, code, {
        model,
        status,
        response: data
      });
    } else if (error.request) {
      // 请求已发送但没有收到响应
      throw new LLMError('无法连接到API服务', 'NETWORK_ERROR', {
        model,
        message: error.message
      });
    } else {
      // 请求配置出错
      throw new LLMError('请求配置错误', 'REQUEST_ERROR', {
        model,
        message: error.message
      });
    }
  }

  // 批量请求（并发控制）
  async batchChat(requests, concurrency = 3) {
    const results = [];
    const queue = [...requests];
    const self = this;
    
    async function processBatch() {
      if (queue.length === 0) return;
      
      const batch = queue.splice(0, concurrency);
      const batchResults = await Promise.allSettled(
        batch.map(req => self.chat(req.messages, req.options))
      );
      
      results.push(...batchResults);
      await processBatch();
    }
    
    await processBatch();
    return results;
  }
}

// 导出单例实例
const llmService = new LLMService();
export default llmService;