import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactECharts from 'echarts-for-react';

// 表单验证模式
const schema = yup.object({
  monthlyIncome: yup.number().positive('收入必须为正数').required('请输入月收入'),
  monthlyExpenses: yup.number().positive('支出必须为正数').required('请输入月支出'),
  savings: yup.number().min(0, '储蓄不能为负数').required('请输入储蓄金额'),
  investments: yup.number().min(0, '投资不能为负数').required('请输入投资金额'),
  debt: yup.number().min(0, '债务不能为负数').required('请输入债务金额'),
  age: yup.number().min(18, '年龄必须满18岁').max(100, '年龄不能超过100岁').required('请输入年龄'),
  financialGoals: yup.string().required('请输入财务目标')
});

const FinancialAnalysis = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });
  
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 财务分析算法
  const analyzeFinances = (data) => {
    const { monthlyIncome, monthlyExpenses, savings, investments, debt, age, financialGoals } = data;
    
    // 计算月度结余
    const monthlySurplus = monthlyIncome - monthlyExpenses;
    
    // 计算储蓄率
    const savingsRate = (monthlySurplus / monthlyIncome) * 100;
    
    // 计算资产负债率
    const totalAssets = savings + investments;
    const debtToAssetRatio = totalAssets > 0 ? (debt / totalAssets) * 100 : 100;
    
    // 计算应急资金充足度（建议3-6个月支出）
    const emergencyFundMonths = savings / monthlyExpenses;
    
    // 计算财务健康度得分
    let healthScore = 100;
    
    // 基于各项指标扣分
    if (monthlySurplus < 0) healthScore -= 30; // 入不敷出
    if (savingsRate < 10) healthScore -= 20; // 储蓄率过低
    if (debtToAssetRatio > 50) healthScore -= 25; // 负债率过高
    if (emergencyFundMonths < 3) healthScore -= 20; // 应急资金不足
    
    // 确保分数在0-100之间
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    // 生成财务健康度等级
    let healthLevel;
    if (healthScore >= 80) healthLevel = '优秀';
    else if (healthScore >= 60) healthLevel = '良好';
    else if (healthScore >= 40) healthLevel = '一般';
    else healthLevel = '较差';
    
    // 生成理财建议
    const suggestions = [];
    
    if (monthlySurplus < 0) {
      suggestions.push('您的支出大于收入，建议减少不必要的开支，制定详细的预算计划');
    } else if (savingsRate < 10) {
      suggestions.push('建议提高储蓄率至少10%，为未来的财务目标做准备');
    } else if (savingsRate > 30) {
      suggestions.push('您的储蓄率较高，可以考虑增加投资比例，提高资产增值潜力');
    }
    
    if (emergencyFundMonths < 3) {
      suggestions.push('建议建立至少3-6个月支出的应急基金，以应对突发情况');
    }
    
    if (debtToAssetRatio > 50) {
      suggestions.push('您的负债率较高，建议优先偿还高利息债务，降低财务风险');
    }
    
    if (investments === 0) {
      suggestions.push('建议开始投资，让资产增值，实现财务目标');
    }
    
    // 基于年龄和财务目标的个性化建议
    if (age < 30) {
      suggestions.push('您处于财富积累初期，建议增加风险承受能力，适当配置权益类资产');
    } else if (age >= 30 && age < 50) {
      suggestions.push('您处于财富增长期，建议平衡风险和收益，构建多元化投资组合');
    } else {
      suggestions.push('您处于财富保值期，建议降低风险偏好，增加固定收益类资产配置');
    }
    
    if (financialGoals.includes('买房')) {
      suggestions.push('为购房目标，建议制定专项储蓄计划，考虑住房贷款的可行性');
    }
    
    if (financialGoals.includes('退休')) {
      suggestions.push('为退休做准备，建议增加养老保险和长期投资的比例');
    }
    
    return {
      monthlyIncome,
      monthlyExpenses,
      monthlySurplus,
      savings,
      investments,
      debt,
      age,
      financialGoals,
      savingsRate,
      debtToAssetRatio,
      emergencyFundMonths,
      healthScore,
      healthLevel,
      suggestions
    };
  };

  // 处理表单提交
  const onSubmit = (data) => {
    setIsLoading(true);
    // 模拟分析过程
    setTimeout(() => {
      const result = analyzeFinances(data);
      setAnalysisResult(result);
      setIsLoading(false);
    }, 1000);
  };

  // 重置表单
  const handleReset = () => {
    reset();
    setAnalysisResult(null);
  };

  return (
    <div className="financial-analysis">
      <h1>个人财务分析</h1>
      
      <div className="analysis-container">
        <div className="form-section">
          <h2>财务信息输入</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="monthlyIncome">月收入（元）</label>
              <input 
                type="number" 
                id="monthlyIncome" 
                {...register('monthlyIncome')}
              />
              {errors.monthlyIncome && <p className="error">{errors.monthlyIncome.message}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="monthlyExpenses">月支出（元）</label>
              <input 
                type="number" 
                id="monthlyExpenses" 
                {...register('monthlyExpenses')}
              />
              {errors.monthlyExpenses && <p className="error">{errors.monthlyExpenses.message}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="savings">储蓄金额（元）</label>
              <input 
                type="number" 
                id="savings" 
                {...register('savings')}
              />
              {errors.savings && <p className="error">{errors.savings.message}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="investments">投资金额（元）</label>
              <input 
                type="number" 
                id="investments" 
                {...register('investments')}
              />
              {errors.investments && <p className="error">{errors.investments.message}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="debt">债务金额（元）</label>
              <input 
                type="number" 
                id="debt" 
                {...register('debt')}
              />
              {errors.debt && <p className="error">{errors.debt.message}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="age">年龄</label>
              <input 
                type="number" 
                id="age" 
                {...register('age')}
              />
              {errors.age && <p className="error">{errors.age.message}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="financialGoals">财务目标</label>
              <input 
                type="text" 
                id="financialGoals" 
                placeholder="例如：买房、退休、子女教育等"
                {...register('financialGoals')}
              />
              {errors.financialGoals && <p className="error">{errors.financialGoals.message}</p>}
            </div>
            
            <div className="form-actions">
              <button type="submit" disabled={isLoading}>
                {isLoading ? '分析中...' : '开始分析'}
              </button>
              <button type="button" onClick={handleReset}>重置</button>
            </div>
          </form>
        </div>
        
        {analysisResult && (
          <div className="result-section">
            <h2>财务健康度报告</h2>
            
            <div className="health-score">
              <h3>财务健康度</h3>
              <div className="score-display">
                <span className="score-value">{analysisResult.healthScore}</span>
                <span className="score-level">{analysisResult.healthLevel}</span>
              </div>
              <div className="score-bar">
                <div 
                  className="score-progress" 
                  style={{ width: `${analysisResult.healthScore}%` }}
                ></div>
              </div>
            </div>
            
            <div className="dashboard-section">
              <h3>财务健康度仪表盘</h3>
              <div className="chart-container">
                <ReactECharts 
                  option={{
                    title: {
                      text: '财务健康度雷达图',
                      left: 'center'
                    },
                    tooltip: {},
                    legend: {
                      data: ['实际值', '目标值'],
                      bottom: 0
                    },
                    radar: {
                      indicator: [
                        { name: '储蓄率', max: 100 },
                        { name: '资产负债率', max: 100 },
                        { name: '应急资金', max: 12 },
                        { name: '月度结余', max: 100 },
                        { name: '投资比例', max: 100 }
                      ]
                    },
                    series: [{
                      name: '财务健康度',
                      type: 'radar',
                      data: [
                        {
                          value: [
                            analysisResult.savingsRate,
                            100 - analysisResult.debtToAssetRatio, // 资产负债率越低越好
                            analysisResult.emergencyFundMonths,
                            (analysisResult.monthlySurplus / analysisResult.monthlyIncome) * 100,
                            (analysisResult.investments / (analysisResult.savings + analysisResult.investments)) * 100 || 0
                          ],
                          name: '实际值',
                          itemStyle: {
                            color: '#5470c6'
                          },
                          areaStyle: {
                            color: 'rgba(84, 112, 198, 0.3)'
                          }
                        },
                        {
                          value: [30, 80, 6, 20, 50],
                          name: '目标值',
                          itemStyle: {
                            color: '#91cc75'
                          },
                          areaStyle: {
                            color: 'rgba(145, 204, 117, 0.3)'
                          }
                        }
                      ]
                    }]
                  }}
                  style={{ height: '400px', width: '100%' }}
                />
              </div>
            </div>
            
            <div className="financial-metrics">
              <h3>财务指标</h3>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">月度结余</span>
                  <span className="metric-value">¥{analysisResult.monthlySurplus.toFixed(2)}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">储蓄率</span>
                  <span className="metric-value">{analysisResult.savingsRate.toFixed(1)}%</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">资产负债率</span>
                  <span className="metric-value">{analysisResult.debtToAssetRatio.toFixed(1)}%</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">应急资金月数</span>
                  <span className="metric-value">{analysisResult.emergencyFundMonths.toFixed(1)}个月</span>
                </div>
              </div>
            </div>
            
            <div className="financial-summary">
              <h3>财务概况</h3>
              <p><strong>月收入：</strong>¥{analysisResult.monthlyIncome.toFixed(2)}</p>
              <p><strong>月支出：</strong>¥{analysisResult.monthlyExpenses.toFixed(2)}</p>
              <p><strong>储蓄：</strong>¥{analysisResult.savings.toFixed(2)}</p>
              <p><strong>投资：</strong>¥{analysisResult.investments.toFixed(2)}</p>
              <p><strong>债务：</strong>¥{analysisResult.debt.toFixed(2)}</p>
              <p><strong>财务目标：</strong>{analysisResult.financialGoals}</p>
            </div>
            
            <div className="suggestions">
              <h3>理财建议</h3>
              <ul>
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
            
            <div className="privacy-note">
              <h3>隐私保护</h3>
              <p>您的财务数据仅在本地进行分析，不会上传到任何服务器，确保您的隐私安全。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialAnalysis;