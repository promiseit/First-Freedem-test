import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  recipientName: yup.string().required('请输入收款人姓名'),
  recipientAccount: yup.string().required('请输入收款账号').min(16, '账号长度至少16位'),
  bankName: yup.string().required('请输入开户行'),
  amount: yup.number().required('请输入汇款金额').positive('金额必须大于0'),
  purpose: yup.string().required('请输入汇款用途'),
  contactPhone: yup.string().required('请输入联系电话').matches(/^1[3-9]\d{9}$/, '请输入正确的手机号码')
});

// 诈骗特征识别算法
const FraudDetection = {
  // 常见诈骗关键词
  scamKeywords: [
    '兼职', '刷单', '返利', '中奖', '领奖', '保证金', '解冻', '验资',
    '手续费', '税费', '公证费', '担保金', '押金', '充值', '投资', '理财',
    '股票', '期货', '外汇', '比特币', '虚拟货币', '网络博彩', '赌博',
    '洗钱', '跑分', '提现', '到账', '激活', '升级', '会员', 'VIP'
  ],
  
  // 异常金额模式
  suspiciousAmounts: [
    10000, 20000, 30000, 50000, 80000, 9999, 19999, 29999, 49999, 99999
  ],
  
  // 异常账户特征
  suspiciousAccountPatterns: [
    /^622[0-9]{13}$/, // 常见诈骗银行卡开头
    /^[0-9]{16,19}$/ // 标准银行卡号长度
  ],
  
  // 检测诈骗特征
  detectFraud: (formData) => {
    const risks = [];
    
    // 检测关键词
    const purposeLower = formData.purpose.toLowerCase();
    for (const keyword of FraudDetection.scamKeywords) {
      if (purposeLower.includes(keyword)) {
        risks.push(`汇款用途包含可疑关键词: ${keyword}`);
        break;
      }
    }
    
    // 检测异常金额
    if (FraudDetection.suspiciousAmounts.includes(formData.amount)) {
      risks.push('汇款金额为常见诈骗金额');
    }
    
    // 检测金额过大
    if (formData.amount > 100000) {
      risks.push('汇款金额过大，请注意风险');
    }
    
    // 检测异常账户
    for (const pattern of FraudDetection.suspiciousAccountPatterns) {
      if (pattern.test(formData.recipientAccount)) {
        risks.push('收款账号可能存在风险');
        break;
      }
    }
    
    // 检测时间模式（非工作时间）
    const now = new Date();
    const hour = now.getHours();
    if (hour < 8 || hour > 22) {
      risks.push('非工作时间汇款，请注意风险');
    }
    
    // 检测行为模式（快速填写）
    if (formData.fillTime < 30) {
      risks.push('填写时间过短，请注意核对信息');
    }
    
    return risks;
  }
};

const Remittance = () => {
  const [risks, setRisks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fillTime, setFillTime] = useState(0);
  const [startTime] = useState(Date.now());
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      setFillTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime]);
  
  const onSubmit = (data) => {
    setIsSubmitting(true);
    
    // 添加填写时间到数据中
    const formData = { ...data, fillTime };
    
    // 检测诈骗风险
    const detectedRisks = FraudDetection.detectFraud(formData);
    setRisks(detectedRisks);
    
    // 如果有风险，阻止提交
    if (detectedRisks.length > 0) {
      setIsSubmitting(false);
      return;
    }
    
    // 模拟提交
    setTimeout(() => {
      alert('汇款信息提交成功！');
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <div className="remittance-container">
      <h1>汇款信息输入</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>收款人姓名</label>
          <input {...register('recipientName')} />
          {errors.recipientName && <p className="error">{errors.recipientName.message}</p>}
        </div>
        
        <div className="form-group">
          <label>收款账号</label>
          <input {...register('recipientAccount')} />
          {errors.recipientAccount && <p className="error">{errors.recipientAccount.message}</p>}
        </div>
        
        <div className="form-group">
          <label>开户行</label>
          <input {...register('bankName')} />
          {errors.bankName && <p className="error">{errors.bankName.message}</p>}
        </div>
        
        <div className="form-group">
          <label>汇款金额</label>
          <input type="number" {...register('amount')} />
          {errors.amount && <p className="error">{errors.amount.message}</p>}
        </div>
        
        <div className="form-group">
          <label>汇款用途</label>
          <input {...register('purpose')} />
          {errors.purpose && <p className="error">{errors.purpose.message}</p>}
        </div>
        
        <div className="form-group">
          <label>联系电话</label>
          <input {...register('contactPhone')} />
          {errors.contactPhone && <p className="error">{errors.contactPhone.message}</p>}
        </div>
        
        {risks.length > 0 && (
          <div className="risk-alert">
            <h3>⚠️ 风险提示</h3>
            <ul>
              {risks.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
            <p className="risk-warning">请仔细核对汇款信息，谨防诈骗！</p>
          </div>
        )}
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '提交汇款'}
        </button>
      </form>
      
      <div className="tips">
        <h3>防诈骗小贴士</h3>
        <ul>
          <li>不要轻信陌生人的汇款要求</li>
          <li>不要向陌生账户汇款</li>
          <li>核对收款人信息和账号</li>
          <li>注意保护个人信息</li>
          <li>如遇可疑情况，及时联系银行</li>
        </ul>
      </div>
    </div>
  );
};

export default Remittance;