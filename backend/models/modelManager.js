const axios = require('axios');
const { modelConfigs } = require('../config');

class ModelManager {
  constructor() {
    this.models = {
      qianwen: this.createQianwenModel(),
      doubao: this.createDoubaoModel(),
      zhipu: this.createZhipuModel(),
      minimax: this.createMinimaxModel()
    };
  }

  // 创建千问模型实例
  createQianwenModel() {
    return {
      name: 'qianwen',
      config: modelConfigs.qianwen,
      async generate(prompt, options = {}) {
        try {
          const response = await axios.post(
            this.config.endpoint,
            {
              model: 'ep-20240415180544-w7t6h',
              messages: [
                {
                  role: 'system',
                  content: '你是防割韭菜Agent，一个勇于谏言的大臣。你会帮助用户识别投资和交易中的潜在风险，防止用户落入陷阱。请保持平和专业的态度，即使面对用户的负面情绪也能保持冷静。'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: options.temperature || 0.7,
              max_tokens: options.maxTokens || 1000
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
              }
            }
          );
          return response.data.choices[0].message.content;
        } catch (error) {
          console.error('Qianwen API error:', error);
          return '抱歉，我暂时无法处理您的请求，请稍后再试。';
        }
      }
    };
  }

  // 创建豆包模型实例
  createDoubaoModel() {
    return {
      name: 'doubao',
      config: modelConfigs.doubao,
      async generate(prompt, options = {}) {
        try {
          const response = await axios.post(
            this.config.endpoint,
            {
              model: 'ep-20240415180544-w7t6h',
              messages: [
                {
                  role: 'system',
                  content: '你是防割韭菜Agent，一个勇于谏言的大臣。你会帮助用户识别投资和交易中的潜在风险，防止用户落入陷阱。请保持平和专业的态度，即使面对用户的负面情绪也能保持冷静。'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: options.temperature || 0.7,
              max_tokens: options.maxTokens || 1000
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
              }
            }
          );
          return response.data.choices[0].message.content;
        } catch (error) {
          console.error('Doubao API error:', error);
          return '抱歉，我暂时无法处理您的请求，请稍后再试。';
        }
      }
    };
  }

  // 创建智谱模型实例
  createZhipuModel() {
    return {
      name: 'zhipu',
      config: modelConfigs.zhipu,
      async generate(prompt, options = {}) {
        try {
          const response = await axios.post(
            this.config.endpoint,
            {
              model: 'chatglm_turbo',
              messages: [
                {
                  role: 'system',
                  content: '你是防割韭菜Agent，一个勇于谏言的大臣。你会帮助用户识别投资和交易中的潜在风险，防止用户落入陷阱。请保持平和专业的态度，即使面对用户的负面情绪也能保持冷静。'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: options.temperature || 0.7,
              max_tokens: options.maxTokens || 1000
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
              }
            }
          );
          return response.data.choices[0].message.content;
        } catch (error) {
          console.error('Zhipu API error:', error);
          return '抱歉，我暂时无法处理您的请求，请稍后再试。';
        }
      }
    };
  }

  // 创建Minimax模型实例
  createMinimaxModel() {
    return {
      name: 'minimax',
      config: modelConfigs.minimax,
      async generate(prompt, options = {}) {
        try {
          const response = await axios.post(
            this.config.endpoint,
            {
              model: 'abab5.5-chat',
              messages: [
                {
                  sender_type: 'system',
                  text: '你是防割韭菜Agent，一个勇于谏言的大臣。你会帮助用户识别投资和交易中的潜在风险，防止用户落入陷阱。请保持平和专业的态度，即使面对用户的负面情绪也能保持冷静。'
                },
                {
                  sender_type: 'user',
                  text: prompt
                }
              ],
              temperature: options.temperature || 0.7,
              max_tokens: options.maxTokens || 1000
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
              }
            }
          );
          return response.data.choices[0].text;
        } catch (error) {
          console.error('Minimax API error:', error);
          return '抱歉，我暂时无法处理您的请求，请稍后再试。';
        }
      }
    };
  }

  // 选择模型并生成响应
  async generateResponse(prompt, modelName = 'qianwen', options = {}) {
    const model = this.models[modelName];
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }
    return await model.generate(prompt, options);
  }

  // 深度思考功能
  async deepThink(prompt) {
    // 使用千问模型进行深度思考
    const deepPrompt = `请对以下内容进行深度分析，识别其中的潜在风险和陷阱：\n\n${prompt}\n\n分析要求：\n1. 识别可能的诈骗或陷阱类型\n2. 分析风险点和漏洞\n3. 提供具体的防范建议\n4. 保持专业、客观的态度`;
    
    return await this.generateResponse(deepPrompt, 'qianwen', { temperature: 0.3 });
  }
}

module.exports = new ModelManager();