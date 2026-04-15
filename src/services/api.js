// 模拟API服务

// 模拟用户数据
let users = [
  {
    id: 1,
    username: 'test',
    password: 'Test123!',
    phone: '13800138000',
    securityQuestion: '你最喜欢的颜色是什么？',
    securityAnswer: '蓝色'
  },
  {
    id: 2,
    username: 'admin',
    password: 'admin123',
    phone: '13900139000',
    securityQuestion: '管理员安全问题？',
    securityAnswer: 'admin'
  }
];

// 模拟短信验证码存储
const smsCodes = new Map();

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 注册
const register = async (userData) => {
  await delay(1000);
  
  const existingUser = users.find(user => user.username === userData.username || user.phone === userData.phone);
  if (existingUser) {
    throw new Error('用户名或手机号已存在');
  }
  
  const newUser = {
    id: users.length + 1,
    ...userData
  };
  
  users.push(newUser);
  return newUser;
};

// 登录
const login = async (username, password) => {
  await delay(800);
  
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    throw new Error('用户名或密码错误');
  }
  
  return user;
};

// 发送短信验证码
const sendSmsCode = async (phone) => {
  await delay(500);
  
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  smsCodes.set(phone, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5分钟过期
  });
  
  console.log(`向 ${phone} 发送验证码: ${code}`);
  return { success: true, message: '验证码已发送' };
};

// 验证短信验证码
const verifySmsCode = async (phone, code) => {
  await delay(300);
  
  const storedCode = smsCodes.get(phone);
  if (!storedCode) {
    throw new Error('验证码不存在');
  }
  
  if (Date.now() > storedCode.expiresAt) {
    throw new Error('验证码已过期');
  }
  
  if (storedCode.code !== code) {
    throw new Error('验证码错误');
  }
  
  smsCodes.delete(phone);
  return { success: true, message: '验证成功' };
};

// 获取安全问题
const getSecurityQuestion = async (username) => {
  await delay(300);
  
  const user = users.find(user => user.username === username);
  if (!user) {
    throw new Error('用户不存在');
  }
  
  return { question: user.securityQuestion };
};

// 验证安全问题
const verifySecurityQuestion = async (username, answer) => {
  await delay(300);
  
  const user = users.find(user => user.username === username);
  if (!user) {
    throw new Error('用户不存在');
  }
  
  if (user.securityAnswer !== answer) {
    throw new Error('答案错误');
  }
  
  return { success: true, message: '验证成功' };
};

// 验证密码
const verifyPassword = async (username, password) => {
  await delay(300);
  
  const user = users.find(user => user.username === username);
  if (!user) {
    throw new Error('用户不存在');
  }
  
  if (user.password !== password) {
    throw new Error('密码错误');
  }
  
  return { success: true, message: '验证成功' };
};

export default {
  register,
  login,
  sendSmsCode,
  verifySmsCode,
  getSecurityQuestion,
  verifySecurityQuestion,
  verifyPassword
};
