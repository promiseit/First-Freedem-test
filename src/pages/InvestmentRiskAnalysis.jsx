import React, { useState, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import llmService from '../services/llmService';
import ReactECharts from 'echarts-for-react';

// 表单验证模式
const schema = yup.object({
  projectName: yup.string().required('项目名称不能为空'),
  industry: yup.string().required('行业不能为空'),
  investmentAmount: yup.number().required('投资金额不能为空').positive('投资金额必须大于0'),
  investmentPeriod: yup.number().required('投资周期不能为空').positive('投资周期必须大于0'),
  expectedReturn: yup.number().required('预期收益率不能为空'),
  projectDescription: yup.string().required('项目描述不能为空').min(10, '项目描述至少10个字符'),
  promoterBackground: yup.string().required('发起方背景不能为空'),
  riskFactors: yup.string().optional(),
  dueDiligence: yup.string().optional(),
  otherInfo: yup.string().optional()
});

// 规则引擎规则
const riskRules = [
  {
    id: 1,
    name: '高收益陷阱',
    condition: (data) => data.expectedReturn > 30,
    severity: 'high',
    description: '预期收益率过高，超过行业平均水平，可能存在欺诈风险'
  },
  {
    id: 2,
    name: '投资周期过短',
    condition: (data) => data.investmentPeriod < 1,
    severity: 'medium',
    description: '投资周期过短，可能无法实现预期收益'
  },
  {
    id: 3,
    name: '信息不完整',
    condition: (data) => data.projectDescription.length < 50,
    severity: 'medium',
    description: '项目描述过于简单，信息不完整，增加投资风险'
  },
  {
    id: 4,
    name: '发起方背景不清晰',
    condition: (data) => data.promoterBackground.length < 30,
    severity: 'medium',
    description: '发起方背景信息不足，无法评估其信誉和能力'
  },
  {
    id: 5,
    name: '高投资金额',
    condition: (data) => data.investmentAmount > 10000000,
    severity: 'high',
    description: '投资金额巨大，风险集中度高，建议分散投资'
  }
];

// 常见投资陷阱
const commonTraps = [
  '庞氏骗局：通过新投资者的资金来支付旧投资者的回报',
  '虚假项目：虚构项目或夸大项目价值',
  '承诺高回报：承诺不切实际的高收益率',
  '信息不透明：故意隐瞒重要信息或提供虚假信息',
  '资质造假：伪造相关资质或证书',
  '限时优惠：制造紧迫感，催促投资者尽快决策',
  '名人背书：利用名人效应增加可信度',
  '复杂结构：使用复杂的投资结构掩盖真实风险'
];

const InvestmentRiskAnalysis = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('');
  const [detectedTraps, setDetectedTraps] = useState([]);
  const [ruleBasedRisks, setRuleBasedRisks] = useState([]);
  const [llmAnalysis, setLlmAnalysis] = useState('');

  // 计算风险等级
  const calculateRiskLevel = useCallback((score) => {
    if (score >= 80) return '极高风险';
    if (score >= 60) return '高风险';
    if (score >= 40) return '中等风险';
    if (score >= 20) return '低风险';
    return '极低风险';
  }, []);

  // 规则引擎分析
  const analyzeWithRules = useCallback((data) => {
    const detectedRisks = riskRules.filter(rule => rule.condition(data));
    setRuleBasedRisks(detectedRisks);
    
    // 计算规则引擎风险分数
    let ruleScore = 0;
    detectedRisks.forEach(risk => {
      if (risk.severity === 'high') ruleScore += 25;
      if (risk.severity === 'medium') ruleScore += 15;
      if (risk.severity === 'low') ruleScore += 5;
    });
    
    return ruleScore;
  }, []);

  // 大模型分析
  const analyzeWithLLM = useCallback(async (data) => {
    try {
      const messages = [
        {
          role: 'system',
          content: `你是一名专业的投资风险分析师，负责识别投资项目中的风险和陷阱。请基于以下项目信息进行风险分析：
          1. 分析项目的潜在风险
          2. 识别可能存在的投资陷阱
          3. 评估项目的可信度
          4. 提供具体的风险缓解建议
          请提供详细、专业的分析报告，包括风险等级评估。`
        },
        {
          role: 'user',
          content: `项目信息：
          项目名称：${data.projectName}
          行业：${data.industry}
          投资金额：${data.investmentAmount}元
          投资周期：${data.investmentPeriod}年
          预期收益率：${data.expectedReturn}%
          项目描述：${data.projectDescription}
          发起方背景：${data.promoterBackground}
          已知风险因素：${data.riskFactors || '无'}
          尽职调查情况：${data.dueDiligence || '无'}
          其他信息：${data.otherInfo || '无'}`
        }
      ];

      const response = await llmService.chat(messages, {
        temperature: 0.3,
        maxTokens: 2000
      });
      
      return response.content;
    } catch (error) {
      console.error('LLM分析失败:', error);
      return '大模型分析失败，请稍后重试';
    }
  }, []);

  // 识别投资陷阱
  const identifyTraps = useCallback((data) => {
    const text = `${data.projectName} ${data.projectDescription} ${data.promoterBackground} ${data.riskFactors || ''} ${data.otherInfo || ''}`.toLowerCase();
    const detected = commonTraps.filter(trap => {
      const keywords = trap.toLowerCase().split('：')[0];
      return text.includes(keywords.toLowerCase());
    });
    setDetectedTraps(detected);
    return detected.length * 10; // 每个检测到的陷阱增加10分风险分数
  }, []);

  // 提交表单处理
  const onSubmit = useCallback(async (data) => {
    setIsAnalyzing(true);
    
    try {
      // 1. 规则引擎分析
      const ruleScore = analyzeWithRules(data);
      
      // 2. 识别投资陷阱
      const trapScore = identifyTraps(data);
      
      // 3. 大模型分析
      const llmResult = await analyzeWithLLM(data);
      setLlmAnalysis(llmResult);
      
      // 4. 计算总风险分数
      const totalScore = ruleScore + trapScore;
      setRiskScore(totalScore);
      setRiskLevel(calculateRiskLevel(totalScore));
      
      // 5. 生成分析结果
      setAnalysisResult({
        projectName: data.projectName,
        industry: data.industry,
        investmentAmount: data.investmentAmount,
        investmentPeriod: data.investmentPeriod,
        expectedReturn: data.expectedReturn,
        riskScore: totalScore,
        riskLevel: calculateRiskLevel(totalScore),
        ruleBasedRisks,
        detectedTraps,
        llmAnalysis: llmResult
      });
    } catch (error) {
      console.error('分析失败:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeWithRules, identifyTraps, analyzeWithLLM, calculateRiskLevel, ruleBasedRisks, detectedTraps]);

  // 重置表单
  const handleReset = useCallback(() => {
    reset();
    setAnalysisResult(null);
    setRiskScore(0);
    setRiskLevel('');
    setDetectedTraps([]);
    setRuleBasedRisks([]);
    setLlmAnalysis('');
  }, [reset]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">投资项目风险分析系统</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 表单部分 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">项目信息输入</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">项目名称</label>
              <input 
                type="text" 
                className={`w-full px-4 py-2 border rounded ${errors.projectName ? 'border-red-500' : 'border-gray-300'}`}
                {...register('projectName')}
              />
              {errors.projectName && <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">行业</label>
              <input 
                type="text" 
                className={`w-full px-4 py-2 border rounded ${errors.industry ? 'border-red-500' : 'border-gray-300'}`}
                {...register('industry')}
              />
              {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">投资金额（元）</label>
                <input 
                  type="number" 
                  className={`w-full px-4 py-2 border rounded ${errors.investmentAmount ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('investmentAmount')}
                />
                {errors.investmentAmount && <p className="text-red-500 text-sm mt-1">{errors.investmentAmount.message}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">投资周期（年）</label>
                <input 
                  type="number" 
                  className={`w-full px-4 py-2 border rounded ${errors.investmentPeriod ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('investmentPeriod')}
                />
                {errors.investmentPeriod && <p className="text-red-500 text-sm mt-1">{errors.investmentPeriod.message}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">预期收益率（%）</label>
                <input 
                  type="number" 
                  className={`w-full px-4 py-2 border rounded ${errors.expectedReturn ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('expectedReturn')}
                />
                {errors.expectedReturn && <p className="text-red-500 text-sm mt-1">{errors.expectedReturn.message}</p>}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">项目描述</label>
              <textarea 
                rows={4} 
                className={`w-full px-4 py-2 border rounded ${errors.projectDescription ? 'border-red-500' : 'border-gray-300'}`}
                {...register('projectDescription')}
              ></textarea>
              {errors.projectDescription && <p className="text-red-500 text-sm mt-1">{errors.projectDescription.message}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">发起方背景</label>
              <textarea 
                rows={3} 
                className={`w-full px-4 py-2 border rounded ${errors.promoterBackground ? 'border-red-500' : 'border-gray-300'}`}
                {...register('promoterBackground')}
              ></textarea>
              {errors.promoterBackground && <p className="text-red-500 text-sm mt-1">{errors.promoterBackground.message}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">已知风险因素（可选）</label>
              <textarea 
                rows={2} 
                className="w-full px-4 py-2 border border-gray-300 rounded"
                {...register('riskFactors')}
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">尽职调查情况（可选）</label>
              <textarea 
                rows={2} 
                className="w-full px-4 py-2 border border-gray-300 rounded"
                {...register('dueDiligence')}
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">其他信息（可选）</label>
              <textarea 
                rows={2} 
                className="w-full px-4 py-2 border border-gray-300 rounded"
                {...register('otherInfo')}
              ></textarea>
            </div>
            
            <div className="flex space-x-4">
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? '分析中...' : '开始分析'}
              </button>
              <button 
                type="button" 
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                onClick={handleReset}
              >
                重置
              </button>
            </div>
          </form>
        </div>
        
        {/* 分析结果部分 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">风险分析报告</h2>
          
          {analysisResult ? (
            <div className="space-y-6">
              {/* 风险概览 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">风险概览</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">项目名称</p>
                    <p className="font-medium">{analysisResult.projectName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">行业</p>
                    <p className="font-medium">{analysisResult.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">投资金额</p>
                    <p className="font-medium">{analysisResult.investmentAmount.toLocaleString()}元</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">投资周期</p>
                    <p className="font-medium">{analysisResult.investmentPeriod}年</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">预期收益率</p>
                    <p className="font-medium">{analysisResult.expectedReturn}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">风险等级</p>
                    <p className={`font-medium ${analysisResult.riskLevel === '极高风险' || analysisResult.riskLevel === '高风险' ? 'text-red-600' : analysisResult.riskLevel === '中等风险' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {analysisResult.riskLevel}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">风险评分</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${riskScore >= 80 ? 'bg-red-600' : riskScore >= 60 ? 'bg-orange-500' : riskScore >= 40 ? 'bg-yellow-500' : riskScore >= 20 ? 'bg-blue-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(riskScore, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm mt-1">{riskScore}/100</p>
                </div>
              </div>
              
              {/* 投资风险分布图 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">投资风险分布</h3>
                <ReactECharts 
                  option={{
                    tooltip: {
                      trigger: 'item'
                    },
                    legend: {
                      top: '5%',
                      left: 'center'
                    },
                    series: [
                      {
                        name: '风险分布',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                          borderRadius: 10,
                          borderColor: '#fff',
                          borderWidth: 2
                        },
                        label: {
                          show: false,
                          position: 'center'
                        },
                        emphasis: {
                          label: {
                            show: true,
                            fontSize: '18',
                            fontWeight: 'bold'
                          }
                        },
                        labelLine: {
                          show: false
                        },
                        data: [
                          {
                            value: ruleBasedRisks.filter(r => r.severity === 'high').length * 25,
                            name: '高风险因素',
                            itemStyle: { color: '#ff4d4f' }
                          },
                          {
                            value: ruleBasedRisks.filter(r => r.severity === 'medium').length * 15,
                            name: '中等风险因素',
                            itemStyle: { color: '#faad14' }
                          },
                          {
                            value: detectedTraps.length * 10,
                            name: '投资陷阱',
                            itemStyle: { color: '#722ed1' }
                          },
                          {
                            value: Math.max(100 - (ruleBasedRisks.filter(r => r.severity === 'high').length * 25 + ruleBasedRisks.filter(r => r.severity === 'medium').length * 15 + detectedTraps.length * 10), 0),
                            name: '安全因素',
                            itemStyle: { color: '#52c41a' }
                          }
                        ]
                      }
                    ]
                  }}
                  style={{ height: '300px', width: '100%' }}
                />
              </div>
              
              {/* 规则引擎检测到的风险 */}
              {ruleBasedRisks.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">规则引擎检测到的风险</h3>
                  <ul className="space-y-2">
                    {ruleBasedRisks.map(risk => (
                      <li key={risk.id} className="flex items-start">
                        <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-2 ${risk.severity === 'high' ? 'bg-red-500' : risk.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                        <div>
                          <p className="font-medium">{risk.name}</p>
                          <p className="text-sm text-gray-600">{risk.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* 检测到的投资陷阱 */}
              {detectedTraps.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">检测到的投资陷阱</h3>
                  <ul className="space-y-2">
                    {detectedTraps.map((trap, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full mt-2 mr-2 bg-red-500"></span>
                        <p className="text-sm">{trap}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* 大模型分析结果 */}
              <div>
                <h3 className="font-medium mb-2">大模型风险分析</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <pre className="whitespace-pre-wrap">{llmAnalysis}</pre>
                </div>
              </div>
              
              {/* 预警信息 */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h3 className="font-medium mb-2">预警信息</h3>
                <ul className="space-y-1 text-sm">
                  {riskScore >= 80 && <li>⚠️ 项目风险极高，建议避免投资</li>}
                  {riskScore >= 60 && <li>⚠️ 项目风险较高，需谨慎投资</li>}
                  {riskScore >= 40 && <li>⚠️ 项目存在中等风险，建议进一步尽职调查</li>}
                  {detectedTraps.length > 0 && <li>⚠️ 检测到投资陷阱，建议仔细核实项目真实性</li>}
                  {analysisResult.expectedReturn > 30 && <li>⚠️ 预期收益率过高，可能存在欺诈风险</li>}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p>请输入项目信息并点击开始分析</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentRiskAnalysis;