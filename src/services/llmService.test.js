// 大模型服务测试
import llmService from './llmService.js';

// 测试函数
async function runTests() {
  console.log('开始测试大模型服务...');
  
  // 测试模型切换
  console.log('\n=== 测试模型切换 ===');
  
  // 获取当前模型
  const currentModel = llmService.getCurrentModel();
  console.log('当前模型:', currentModel);
  
  // 获取所有可用模型
  const availableModels = llmService.getAvailableModels();
  console.log('可用模型:', availableModels);
  
  // 切换模型
  for (const model of availableModels) {
    try {
      const newModel = llmService.setModel(model);
      console.log(`切换到模型 ${model}:`, newModel);
    } catch (error) {
      console.error(`切换模型 ${model} 失败:`, error.message);
    }
  }
  
  // 切回默认模型
  llmService.setModel('openai');
  console.log('切回默认模型:', llmService.getCurrentModel());
  
  // 测试错误处理
  console.log('\n=== 测试错误处理 ===');
  
  // 测试无效模型
  try {
    llmService.setModel('invalid-model');
  } catch (error) {
    console.log('测试无效模型错误:', error.message, error.code);
  }
  
  // 测试API调用错误（模拟）
  console.log('注意：真实API调用测试需要配置有效的API密钥');
  
  // 测试批量请求
  console.log('\n=== 测试批量请求 ===');
  
  const requests = [
    {
      messages: [{ role: 'user', content: '你好，我是测试1' }],
      options: { model: 'openai' }
    },
    {
      messages: [{ role: 'user', content: '你好，我是测试2' }],
      options: { model: 'anthropic' }
    },
    {
      messages: [{ role: 'user', content: '你好，我是测试3' }],
      options: { model: 'ollama' }
    }
  ];
  
  try {
    const results = await llmService.batchChat(requests, 2);
    console.log('批量请求结果数量:', results.length);
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`请求 ${index + 1} 成功`);
      } else {
        console.log(`请求 ${index + 1} 失败:`, result.reason.message);
      }
    });
  } catch (error) {
    console.error('批量请求测试失败:', error.message);
  }
  
  console.log('\n测试完成！');
}

// 运行测试
runTests().catch(console.error);