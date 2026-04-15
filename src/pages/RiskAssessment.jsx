import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// 表单验证规则
const schema = yup.object({
  age: yup.number().min(18, '年龄必须满18岁').max(100, '年龄不能超过100岁').required('请输入年龄'),
  income: yup.number().positive('收入必须为正数').required('请输入月收入'),
  savings: yup.number().min(0, '储蓄不能为负数').required('请输入储蓄金额'),
  debt: yup.number().min(0, '债务不能为负数').required('请输入债务金额'),
  riskTolerance: yup.number().min(1, '风险承受能力必须在1-10之间').max(10, '风险承受能力必须在1-10之间').required('请输入风险承受能力'),
  investmentExperience: yup.string().required('请选择投资经验')
});

const RiskAssessment = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });
  
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [isAssessing, setIsAssessing] = useState(false);

  // 风险评估算法
  const assessRisk = (data) => {
    setIsAssessing(true);
    
    // 模拟评估过程
    setTimeout(() => {
      // 计算各项风险指标
      const ageRisk = Math.min(100, (data.age - 18) * 2);
      const incomeRisk = Math.min(100, (100000 - data.income) / 1000);
      const savingsRisk = Math.min(100, (50000 - data.savings) / 500);
      const debtRisk = Math.min(100, (data.debt / (data.income * 12)) * 100);
      const riskToleranceRisk = Math.min(100, (10 - data.riskTolerance) * 10);
      const experienceRisk = data.investmentExperience === '无' ? 80 : data.investmentExperience === '1-3年' ? 50 : 20;

      // 计算综合风险分数
      const totalRiskScore = (ageRisk + incomeRisk + savingsRisk + debtRisk + riskToleranceRisk + experienceRisk) / 6;
      
      // 确定风险等级
      let riskLevel;
      if (totalRiskScore >= 80) riskLevel = '极高风险';
      else if (totalRiskScore >= 60) riskLevel = '高风险';
      else if (totalRiskScore >= 40) riskLevel = '中等风险';
      else if (totalRiskScore >= 20) riskLevel = '低风险';
      else riskLevel = '极低风险';

      const result = {
        age: data.age,
        income: data.income,
        savings: data.savings,
        debt: data.debt,
        riskTolerance: data.riskTolerance,
        investmentExperience: data.investmentExperience,
        ageRisk,
        incomeRisk,
        savingsRisk,
        debtRisk,
        riskToleranceRisk,
        experienceRisk,
        totalRiskScore,
        riskLevel
      };

      setAssessmentResult(result);
      setIsAssessing(false);
    }, 1000);
  };

  const onSubmit = (data) => {
    assessRisk(data);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">个人风险评估</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 表单部分 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">个人信息输入</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">年龄</label>
              <input 
                type="number" 
                className={`w-full px-4 py-2 border rounded ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                {...register('age')}
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">月收入（元）</label>
              <input 
                type="number" 
                className={`w-full px-4 py-2 border rounded ${errors.income ? 'border-red-500' : 'border-gray-300'}`}
                {...register('income')}
              />
              {errors.income && <p className="text-red-500 text-sm mt-1">{errors.income.message}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">储蓄金额（元）</label>
              <input 
                type="number" 
                className={`w-full px-4 py-2 border rounded ${errors.savings ? 'border-red-500' : 'border-gray-300'}`}
                {...register('savings')}
              />
              {errors.savings && <p className="text-red-500 text-sm mt-1">{errors.savings.message}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">债务金额（元）</label>
              <input 
                type="number" 
                className={`w-full px-4 py-2 border rounded ${errors.debt ? 'border-red-500' : 'border-gray-300'}`}
                {...register('debt')}
              />
              {errors.debt && <p className="text-red-500 text-sm mt-1">{errors.debt.message}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">风险承受能力（1-10）</label>
              <input 
                type="number" 
                className={`w-full px-4 py-2 border rounded ${errors.riskTolerance ? 'border-red-500' : 'border-gray-300'}`}
                {...register('riskTolerance')}
              />
              {errors.riskTolerance && <p className="text-red-500 text-sm mt-1">{errors.riskTolerance.message}</p>}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">投资经验</label>
              <select 
                className={`w-full px-4 py-2 border rounded ${errors.investmentExperience ? 'border-red-500' : 'border-gray-300'}`}
                {...register('investmentExperience')}
              >
                <option value="">请选择投资经验</option>
                <option value="无">无</option>
                <option value="1-3年">1-3年</option>
                <option value="3年以上">3年以上</option>
              </select>
              {errors.investmentExperience && <p className="text-red-500 text-sm mt-1">{errors.investmentExperience.message}</p>}
            </div>
            
            <button 
              type="submit" 
              className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              disabled={isAssessing}
            >
              {isAssessing ? '评估中...' : '开始评估'}
            </button>
          </form>
        </div>
        
        {/* 评估结果部分 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">风险评估结果</h2>
          
          {assessmentResult ? (
            <div className="space-y-6">
              {/* 风险等级 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">风险等级</h3>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${assessmentResult.riskLevel === '极高风险' || assessmentResult.riskLevel === '高风险' ? 'text-red-600' : assessmentResult.riskLevel === '中等风险' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {assessmentResult.riskLevel}
                  </p>
                  <p className="text-gray-600 mt-2">风险评分: {assessmentResult.totalRiskScore.toFixed(1)}/100</p>
                </div>
              </div>
              
              {/* 风险评估雷达图 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">风险评估雷达图</h3>
                <ReactECharts 
                  option={{
                    title: {
                      text: '个人风险评估',
                      left: 'center'
                    },
                    tooltip: {},
                    legend: {
                      data: ['风险值'],
                      bottom: 0
                    },
                    radar: {
                      indicator: [
                        { name: '年龄风险', max: 100 },
                        { name: '收入风险', max: 100 },
                        { name: '储蓄风险', max: 100 },
                        { name: '债务风险', max: 100 },
                        { name: '风险承受能力', max: 100 },
                        { name: '投资经验', max: 100 }
                      ]
                    },
                    series: [{
                      name: '风险评估',
                      type: 'radar',
                      data: [
                        {
                          value: [
                            assessmentResult.ageRisk,
                            assessmentResult.incomeRisk,
                            assessmentResult.savingsRisk,
                            assessmentResult.debtRisk,
                            assessmentResult.riskToleranceRisk,
                            assessmentResult.experienceRisk
                          ],
                          name: '风险值',
                          itemStyle: {
                            color: '#ff4d4f'
                          },
                          areaStyle: {
                            color: 'rgba(255, 77, 79, 0.3)'
                          }
                        }
                      ]
                    }]
                  }}
                  style={{ height: '400px', width: '100%' }}
                />
              </div>
              
              {/* 风险分析 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">风险分析</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>年龄风险:</span>
                    <span className={`font-medium ${assessmentResult.ageRisk >= 60 ? 'text-red-600' : assessmentResult.ageRisk >= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {assessmentResult.ageRisk.toFixed(1)}/100
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>收入风险:</span>
                    <span className={`font-medium ${assessmentResult.incomeRisk >= 60 ? 'text-red-600' : assessmentResult.incomeRisk >= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {assessmentResult.incomeRisk.toFixed(1)}/100
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>储蓄风险:</span>
                    <span className={`font-medium ${assessmentResult.savingsRisk >= 60 ? 'text-red-600' : assessmentResult.savingsRisk >= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {assessmentResult.savingsRisk.toFixed(1)}/100
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>债务风险:</span>
                    <span className={`font-medium ${assessmentResult.debtRisk >= 60 ? 'text-red-600' : assessmentResult.debtRisk >= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {assessmentResult.debtRisk.toFixed(1)}/100
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>风险承受能力:</span>
                    <span className={`font-medium ${assessmentResult.riskToleranceRisk >= 60 ? 'text-red-600' : assessmentResult.riskToleranceRisk >= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {assessmentResult.riskToleranceRisk.toFixed(1)}/100
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>投资经验:</span>
                    <span className={`font-medium ${assessmentResult.experienceRisk >= 60 ? 'text-red-600' : assessmentResult.experienceRisk >= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {assessmentResult.experienceRisk.toFixed(1)}/100
                    </span>
                  </li>
                </ul>
              </div>
              
              {/* 建议 */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h3 className="font-medium mb-2">风险缓解建议</h3>
                <ul className="space-y-1 text-sm">
                  {assessmentResult.totalRiskScore >= 80 && <li>⚠️ 您的风险等级极高，建议避免高风险投资，优先保障资金安全</li>}
                  {assessmentResult.totalRiskScore >= 60 && <li>⚠️ 您的风险等级较高，建议降低投资组合的风险水平</li>}
                  {assessmentResult.totalRiskScore >= 40 && <li>⚠️ 您的风险等级中等，建议平衡风险和收益，构建多元化投资组合</li>}
                  {assessmentResult.ageRisk >= 60 && <li>⚠️ 年龄因素风险较高，建议增加固定收益类资产的配置比例</li>}
                  {assessmentResult.incomeRisk >= 60 && <li>⚠️ 收入风险较高，建议增加应急基金储备，保障基本生活需求</li>}
                  {assessmentResult.savingsRisk >= 60 && <li>⚠️ 储蓄风险较高，建议增加储蓄金额，提高财务稳定性</li>}
                  {assessmentResult.debtRisk >= 60 && <li>⚠️ 债务风险较高，建议优先偿还高利息债务，降低财务负担</li>}
                  {assessmentResult.riskToleranceRisk >= 60 && <li>⚠️ 风险承受能力较低，建议选择低风险投资产品</li>}
                  {assessmentResult.experienceRisk >= 60 && <li>⚠️ 投资经验不足，建议加强投资知识学习，从小额投资开始</li>}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p>请输入个人信息并点击开始评估</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;