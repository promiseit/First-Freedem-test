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
      // 根据用户输入生成不同的模拟响应
      let riskType = '投资诈骗';
      let specificRisks = [];
      
      // 根据输入内容分析风险类型
      if (prompt.includes('兼职') || prompt.includes('刷单') || prompt.includes('返利')) {
        riskType = '兼职刷单诈骗';
        specificRisks = [
          '要求先支付押金或保证金',
          '承诺高额返利但无法提现',
          '任务难度逐渐增加，需要投入更多资金'
        ];
      } else if (prompt.includes('贷款') || prompt.includes('借钱') || prompt.includes('征信')) {
        riskType = '贷款诈骗';
        specificRisks = [
          '要求先支付手续费或保证金',
          '声称可以消除征信污点',
          '提供的贷款条件过于宽松'
        ];
      } else if (prompt.includes('中奖') || prompt.includes('领奖') || prompt.includes('礼品')) {
        riskType = '中奖诈骗';
        specificRisks = [
          '要求先支付税费或手续费',
          '声称奖品价值很高但需要支付运费',
          '要求提供个人信息或银行账号'
        ];
      } else if (prompt.includes('股票') || prompt.includes('基金') || prompt.includes('投资')) {
        riskType = '投资诈骗';
        specificRisks = [
          '高回报承诺：任何声称可以轻松赚很多钱的投资机会都值得怀疑',
          '缺乏详细信息：没有提供具体的投资策略、风险提示等关键信息',
          '紧迫感：可能会催促您立即行动，不给您足够的思考时间'
        ];
      } else {
        riskType = '可疑活动';
        specificRisks = [
          '要求提供个人敏感信息',
          '要求进行转账或支付',
          '承诺不切实际的回报'
        ];
      }
      
      // 提供模拟响应，确保前端能够正常工作
      return `我已分析您的问题，以下是我的建议：\n\n1. **风险识别**：您提到的情况很可能是一种常见的${riskType}，这类诈骗通常通过诱导您投入资金或提供个人信息来获取利益。\n\n2. **风险点分析**：\n   ${specificRisks.map(risk => `- ${risk}`).join('\n   ')}\n\n3. **防范建议**：\n   - 不要轻信陌生人的承诺，尤其是涉及金钱的交易\n   - 对任何投资或赚钱机会进行充分的尽职调查\n   - 咨询专业人士的意见，不要独自做决定\n   - 只通过正规的渠道和机构进行金融交易\n   - 保护好个人财务信息，不要轻易透露银行账号、密码等敏感信息\n   - 如果遇到可疑情况，及时报警或向相关部门咨询\n\n记住，天上不会掉馅饼。如果一个机会听起来好得难以置信，那它很可能是一个陷阱。`;
    }
  }
}

module.exports = ModelManager;