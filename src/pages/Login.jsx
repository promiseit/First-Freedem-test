import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const schema = yup.object({
  username: yup.string().required('用户名不能为空'),
  password: yup.string().required('密码不能为空')
});

const Login = () => {
  const navigate = useNavigate();
  const { login, updateVerificationStatus } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      const user = await api.login(data.username, data.password);
      login(user);
      
      // 登录成功后进行验证
      await verifyUser(user);
      
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUser = async (user) => {
    try {
      // 模拟验证流程
      updateVerificationStatus('password', true);
      
      // 发送短信验证码
      await api.sendSmsCode(user.phone);
      const smsCode = prompt('请输入短信验证码:');
      if (smsCode) {
        await api.verifySmsCode(user.phone, smsCode);
        updateVerificationStatus('sms', true);
      }
      
      // 验证安全问题
      const { question } = await api.getSecurityQuestion(user.username);
      const answer = prompt(question);
      if (answer) {
        await api.verifySecurityQuestion(user.username, answer);
        updateVerificationStatus('securityQuestion', true);
      }
    } catch (err) {
      console.error('验证失败:', err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>登录</h2>
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
          {isLoading ? '登录中...' : '登录'}
        </button>
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <span>还没有账号？</span>
          <a href="/register" style={{ marginLeft: '5px' }}>立即注册</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
