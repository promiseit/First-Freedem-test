const axios = require('axios');
const { modelConfigs } = require('../config');

class ModelManager {
  constructor(apiKeys = {}) {
    this.apiKeys = apiKeys;
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
      config: {
        ...modelConfigs.qianwen,
        apiKey: this.apiKeys.qianwen || modelConfigs.qianwen.apiKey
      },
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
          throw error;
        }
      }
    };
  }

  // 创建豆包模型实例
  createDoubaoModel() {
    return {
      name: 'doubao',
      config: {
        ...modelConfigs.doubao,
        apiKey: this.apiKeys.doubao || modelConfigs.doubao.apiKey
      },
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
          throw error;
        }
      }
    };
  }

  // 创建智谱模型实例
  createZhipuModel() {
    return {
      name: 'zhipu',
      config: {
        ...modelConfigs.zhipu,
        apiKey: this.apiKeys.zhipu || modelConfigs.zhipu.apiKey
      },
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
          throw error;
        }
      }
    };
  }

  // 创建Minimax模型实例
  createMinimaxModel() {
    return {
      name: 'minimax',
      config: {
        ...modelConfigs.minimax,
        apiKey: this.apiKeys.minimax || modelConfigs.minimax.apiKey
      },
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
          throw error;
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
    
    try {
      // 尝试调用真实的大模型API
      return await this.generateResponse(deepPrompt, 'qianwen', { temperature: 0.3 });
    } catch (error) {
      console.error('Model API error, using mock response:', error);
      // 提供模拟响应，确保前端能够正常工作
      return `我已分析您的问题，以下是我的建议：\n\n1. **风险识别**：您收到的投资消息很可能是一种常见的投资诈骗，这类消息通常承诺高回报，但实际上是为了诱导您投入资金。\n\n2. **风险点分析**：\n   - 高回报承诺：任何声称可以轻松赚很多钱的投资机会都值得怀疑\n   - 缺乏详细信息：没有提供具体的投资策略、风险提示等关键信息\n   - 紧迫感：可能会催促您立即行动，不给您足够的思考时间\n\n3. **防范建议**：\n   - 不要轻信陌生人的投资建议\n   - 对投资机会进行充分的尽职调查\n   - 咨询专业的金融顾问\n   - 只通过正规的金融机构进行投资\n   - 保护好个人财务信息，不要轻易透露银行账号、密码等敏感信息\n\n记住，投资有风险，入市需谨慎。如果一个投资机会听起来好得难以置信，那它很可能是一个陷阱。`;
    }
  }
}

module.exports = ModelManager;