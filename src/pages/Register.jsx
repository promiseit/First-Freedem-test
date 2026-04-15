import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const schema = yup.object({
  username: yup.string().required('用户名不能为空'),
  password: yup.string()
    .required('密码不能为空')
    .min(6, '密码长度至少6位')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, '密码必须包含大小写字母、数字和特殊字符'),
  phone: yup.string()
    .required('手机号不能为空')
    .matches(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  securityQuestion: yup.string().required('请选择安全问题'),
  securityAnswer: yup.string().required('请输入安全问题答案')
});

const securityQuestions = [
  '你最喜欢的颜色是什么？',
  '你母亲的名字是什么？',
  '你出生的城市是哪里？',
  '你最喜欢的电影是什么？',
  '你小学的名字是什么？'
];

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [smsCode, setSmsCode] = useState('');
  const [smsError, setSmsError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(schema)
  });

  const phone = watch('phone');

  const sendSms = async () => {
    if (!phone) {
      setSmsError('请先输入手机号');
      return;
    }
    
    try {
      setIsLoading(true);
      await api.sendSmsCode(phone);
      setSmsSent(true);
      setSmsError('');
      setCountdown(60);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setSmsSent(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setSmsError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifySms = async () => {
    if (!smsCode) {
      setSmsError('请输入验证码');
      return;
    }
    
    try {
      setIsLoading(true);
      await api.verifySmsCode(phone, smsCode);
      setSmsError('');
      return true;
    } catch (err) {
      setSmsError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      // 验证短信验证码
      const isSmsVerified = await verifySms();
      if (!isSmsVerified) {
        return;
      }
      
      await api.register(data);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>注册</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '15px' }}>
          <label>用户名</label>
          <input
            type="text"
            {...register('username')}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {errors.username && <div style={{ color: 'red', fontSize: '12px' }}>{errors.username.message}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>密码</label>
          <input
            type="password"
            {...register('password')}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {errors.password && <div style={{ color: 'red', fontSize: '12px' }}>{errors.password.message}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>手机号</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <input
              type="text"
              {...register('phone')}
              style={{ flex: 1, padding: '8px' }}
            />
            <button
              type="button"
              onClick={sendSms}
              disabled={smsSent || isLoading}
              style={{
                padding: '8px 12px',
                backgroundColor: smsSent ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: smsSent || isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {smsSent ? `${countdown}秒后重发` : '发送验证码'}
            </button>
          </div>
          {errors.phone && <div style={{ color: 'red', fontSize: '12px' }}>{errors.phone.message}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>短信验证码</label>
          <input
            type="text"
            value={smsCode}
            onChange={(e) => setSmsCode(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {smsError && <div style={{ color: 'red', fontSize: '12px' }}>{smsError}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>安全问题</label>
          <select
            {...register('securityQuestion')}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">请选择安全问题</option>
            {securityQuestions.map((question, index) => (
              <option key={index} value={question}>{question}</option>
            ))}
          </select>
          {errors.securityQuestion && <div style={{ color: 'red', fontSize: '12px' }}>{errors.securityQuestion.message}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>安全问题答案</label>
          <input
            type="text"
            {...register('securityAnswer')}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {errors.securityAnswer && <div style={{ color: 'red', fontSize: '12px' }}>{errors.securityAnswer.message}</div>}
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '注册中...' : '注册'}
        </button>
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <span>已有账号？</span>
          <a href="/login" style={{ marginLeft: '5px' }}>立即登录</a>
        </div>
      </form>
    </div>
  );
};

export default Register;
