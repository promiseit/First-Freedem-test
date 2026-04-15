import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactECharts from 'echarts-for-react';

// 表单验证规则
const schema = yup.object({
  monthlyIncome: yup.number().positive('月收入必须为正数').required('请输入月收入'),
  monthlyExpenses: yup.array().of(
    yup.object({
      category: yup.string().required('请选择消费类别'),
      amount: yup.number().positive('消费金额必须为正数').required('请输入消费金额'),
      frequency: yup.string().required('请选择消费频率')
    })
  ),
  savingsGoal: yup.number().nonNegative('储蓄目标不能为负数').required('请输入储蓄目标'),
  financialEmergency: yup.number().nonNegative('应急基金不能为负数').required('请输入应急基金'),
  debtAmount: yup.number().nonNegative('债务金额不能为负数').required('请输入债务金额')
});

// 消费类别选项
const categories = [
  '食品', '交通', '住房', '娱乐', '购物', '医疗', '教育', '其他'
];

// 消费频率选项
const frequencies = [
  '每月', '每季度', '每年'
];

const ConsumptionPlan = () => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      monthlyIncome: '',
      monthlyExpenses: [{ category: '', amount: '', frequency: '每月' }],
      savingsGoal: '',
      financialEmergency: '',
      debtAmount: ''
    }
  });

  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const expenses = watch('monthlyExpenses');

  // 添加新的消费项
  const addExpense = () => {
    setValue('monthlyExpenses', [...expenses, { category: '', amount: '', frequency: '每月' }]);
  };

  // 删除消费项
  const removeExpense = (index) => {
    const newExpenses = [...expenses];
    newExpenses.splice(index, 1);
    setValue('monthlyExpenses', newExpenses);
  };

  // 分析消费行为
  const analyzeConsumption = (data) => {
    setIsAnalyzing(true);
    
    // 模拟分析过程
    setTimeout(() => {
      // 计算总月支出
      const totalMonthlyExpenses = data.monthlyExpenses.reduce((total, expense) => {
        let monthlyAmount = expense.amount;
        if (expense.frequency === '每季度') {
          monthlyAmount = expense.amount / 3;
        } else if (expense.frequency === '每年') {
          monthlyAmount = expense.amount / 12;
        }
        return total + monthlyAmount;
      }, 0);

      // 计算可支配收入
      const disposableIncome = data.monthlyIncome - totalMonthlyExpenses;

      // 计算储蓄率
      const savingsRate = (data.savingsGoal / data.monthlyIncome) * 100;

      // 计算债务收入比
      const debtToIncomeRatio = (data.debtAmount / (data.monthlyIncome * 12)) * 100;

      // 计算应急基金充足率
      const emergencyFundRatio = (data.financialEmergency / totalMonthlyExpenses);

      // 消费类别分析
      const categoryAnalysis = {};
      data.monthlyExpenses.forEach(expense => {
        let monthlyAmount = expense.amount;
        if (expense.frequency === '每季度') {
          monthlyAmount = expense.amount / 3;
        } else if (expense.frequency === '每年') {
          monthlyAmount = expense.amount / 12;
        }
        
        if (!categoryAnalysis[expense.category]) {
          categoryAnalysis[expense.category] = 0;
        }
        categoryAnalysis[expense.category] += monthlyAmount;
      });

      // 生成消费建议
      const suggestions = [];
      
      if (totalMonthlyExpenses > data.monthlyIncome * 0.8) {
        suggestions.push('您的支出占收入比例过高，建议减少非必要开支');
      }
      
      if (savingsRate < 10) {
        suggestions.push('您的储蓄率过低，建议提高储蓄比例至少10%');
      }
      
      if (debtToIncomeRatio > 36) {
        suggestions.push('您的债务收入比过高，建议优先偿还高利息债务');
      }
      
      if (emergencyFundRatio < 3) {
        suggestions.push('您的应急基金不足，建议积累至少3个月的生活支出');
      }
      
      // 分析消费类别占比
      const categoryPercentages = {};
      Object.entries(categoryAnalysis).forEach(([category, amount]) => {
        categoryPercentages[category] = (amount / totalMonthlyExpenses) * 100;
      });
      
      // 检查是否有异常消费类别
      if (categoryPercentages['娱乐'] > 30) {
        suggestions.push('您在娱乐方面的支出占比过高，建议适当控制');
      }
      
      if (categoryPercentages['购物'] > 25) {
        suggestions.push('您在购物方面的支出占比过高，建议理性消费');
      }

      const result = {
        totalMonthlyExpenses,
        disposableIncome,
        savingsRate,
        debtToIncomeRatio,
        emergencyFundRatio,
        categoryAnalysis,
        categoryPercentages,
        suggestions
      };

      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 1000);
  };

  const onSubmit = (data) => {
    analyzeConsumption(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">消费计划与分析</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
        {/* 月收入 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">月收入</label>
          <input
            type="number"
            className={`w-full px-4 py-2 border rounded-md ${errors.monthlyIncome ? 'border-red-500' : 'border-gray-300'}`}
            {...register('monthlyIncome')}
            placeholder="请输入您的月收入"
          />
          {errors.monthlyIncome && <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome.message}</p>}
        </div>

        {/* 消费支出 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">消费支出</label>
            <button 
              type="button" 
              onClick={addExpense}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              添加消费项
            </button>
          </div>
          
          {expenses.map((expense, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 mb-4 p-4 border rounded-md">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">消费类别</label>
                <select
                  className={`w-full px-4 py-2 border rounded-md ${errors.monthlyExpenses?.[index]?.category ? 'border-red-500' : 'border-gray-300'}`}
                  {...register(`monthlyExpenses.${index}.category`)}
                >
                  <option value="">请选择类别</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.monthlyExpenses?.[index]?.category && <p className="text-red-500 text-xs mt-1">{errors.monthlyExpenses[index].category.message}</p>}
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">消费金额</label>
                <input
                  type="number"
                  className={`w-full px-4 py-2 border rounded-md ${errors.monthlyExpenses?.[index]?.amount ? 'border-red-500' : 'border-gray-300'}`}
                  {...register(`monthlyExpenses.${index}.amount`, { valueAsNumber: true })}
                  placeholder="请输入金额"
                />
                {errors.monthlyExpenses?.[index]?.amount && <p className="text-red-500 text-xs mt-1">{errors.monthlyExpenses[index].amount.message}</p>}
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">消费频率</label>
                <select
                  className={`w-full px-4 py-2 border rounded-md ${errors.monthlyExpenses?.[index]?.frequency ? 'border-red-500' : 'border-gray-300'}`}
                  {...register(`monthlyExpenses.${index}.frequency`)}
                >
                  {frequencies.map(frequency => (
                    <option key={frequency} value={frequency}>{frequency}</option>
                  ))}
                </select>
                {errors.monthlyExpenses?.[index]?.frequency && <p className="text-red-500 text-xs mt-1">{errors.monthlyExpenses[index].frequency.message}</p>}
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeExpense(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 储蓄目标 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">月度储蓄目标</label>
          <input
            type="number"
            className={`w-full px-4 py-2 border rounded-md ${errors.savingsGoal ? 'border-red-500' : 'border-gray-300'}`}
            {...register('savingsGoal', { valueAsNumber: true })}
            placeholder="请输入月度储蓄目标"
          />
          {errors.savingsGoal && <p className="text-red-500 text-xs mt-1">{errors.savingsGoal.message}</p>}
        </div>

        {/* 应急基金 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">应急基金</label>
          <input
            type="number"
            className={`w-full px-4 py-2 border rounded-md ${errors.financialEmergency ? 'border-red-500' : 'border-gray-300'}`}
            {...register('financialEmergency', { valueAsNumber: true })}
            placeholder="请输入应急基金金额"
          />
          {errors.financialEmergency && <p className="text-red-500 text-xs mt-1">{errors.financialEmergency.message}</p>}
        </div>

        {/* 债务金额 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">总债务金额</label>
          <input
            type="number"
            className={`w-full px-4 py-2 border rounded-md ${errors.debtAmount ? 'border-red-500' : 'border-gray-300'}`}
            {...register('debtAmount', { valueAsNumber: true })}
            placeholder="请输入总债务金额"
          />
          {errors.debtAmount && <p className="text-red-500 text-xs mt-1">{errors.debtAmount.message}</p>}
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isAnalyzing}
        >
          {isAnalyzing ? '分析中...' : '分析消费行为'}
        </button>
      </form>

      {/* 分析结果 */}
      {analysisResult && (
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">消费分析结果</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">财务概览</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>总月支出:</span>
                  <span className="font-medium">¥{analysisResult.totalMonthlyExpenses.toFixed(2)}</span>
                </li>
                <li className="flex justify-between">
                  <span>可支配收入:</span>
                  <span className="font-medium">¥{analysisResult.disposableIncome.toFixed(2)}</span>
                </li>
                <li className="flex justify-between">
                  <span>储蓄率:</span>
                  <span className="font-medium">{analysisResult.savingsRate.toFixed(1)}%</span>
                </li>
                <li className="flex justify-between">
                  <span>债务收入比:</span>
                  <span className="font-medium">{analysisResult.debtToIncomeRatio.toFixed(1)}%</span>
                </li>
                <li className="flex justify-between">
                  <span>应急基金充足率:</span>
                  <span className="font-medium">{analysisResult.emergencyFundRatio.toFixed(1)}个月</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">消费类别占比</h3>
              <ReactECharts 
                option={{
                  tooltip: {
                    trigger: 'item'
                  },
                  legend: {
                    orient: 'vertical',
                    left: 'left',
                    top: 'center'
                  },
                  series: [
                    {
                      name: '消费类别',
                      type: 'pie',
                      radius: '60%',
                      data: Object.entries(analysisResult.categoryAnalysis).map(([category, amount]) => ({
                        name: category,
                        value: amount
                      })),
                      emphasis: {
                        itemStyle: {
                          shadowBlur: 10,
                          shadowOffsetX: 0,
                          shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                      }
                    }
                  ]
                }}
                style={{ height: '300px', width: '100%' }}
              />
            </div>
          </div>

          {/* 消费建议 */}
          <div className="bg-white p-4 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">理性消费建议</h3>
            {analysisResult.suggestions.length > 0 ? (
              <ul className="space-y-2">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-600">您的消费习惯良好，继续保持！</p>
            )}
          </div>

          {/* 详细消费分析 */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">详细消费分析</h3>
            <p className="mb-4">基于您的财务状况和消费习惯，我们为您提供以下分析：</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">支出分析</h4>
                <p>
                  您的总月支出为 ¥{analysisResult.totalMonthlyExpenses.toFixed(2)}，
                  {analysisResult.totalMonthlyExpenses > analysisResult.disposableIncome ? 
                    '支出大于可支配收入，存在入不敷出的风险。' : 
                    '支出在可接受范围内。'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">储蓄分析</h4>
                <p>
                  您的储蓄率为 {analysisResult.savingsRate.toFixed(1)}%，
                  {analysisResult.savingsRate < 10 ? 
                    '建议提高储蓄比例，以应对未来的财务需求。' : 
                    '储蓄率在合理范围内。'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">债务分析</h4>
                <p>
                  您的债务收入比为 {analysisResult.debtToIncomeRatio.toFixed(1)}%，
                  {analysisResult.debtToIncomeRatio > 36 ? 
                    '债务比例过高，建议优先偿还高利息债务。' : 
                    '债务比例在合理范围内。'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">应急基金分析</h4>
                <p>
                  您的应急基金可覆盖 {analysisResult.emergencyFundRatio.toFixed(1)} 个月的支出，
                  {analysisResult.emergencyFundRatio < 3 ? 
                    '应急基金不足，建议积累至少3个月的生活支出。' : 
                    '应急基金充足。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionPlan;