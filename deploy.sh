#!/bin/bash

# 防割韭菜Agent部署脚本

echo "开始部署防割韭菜Agent..."

# 进入项目根目录
cd "$(dirname "$0")"

# 1. 构建前端项目
echo "构建前端项目..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
  echo "前端构建失败，部署终止"
  exit 1
fi

cd ..

# 2. 准备后端项目
echo "准备后端项目..."
cd backend
npm install

if [ $? -ne 0 ]; then
  echo "后端依赖安装失败，部署终止"
  exit 1
fi

cd ..

# 3. 创建部署目录
echo "创建部署目录..."
rm -rf deploy
mkdir -p deploy/frontend deploy/backend/uploads

# 4. 复制文件
echo "复制文件..."
cp -r frontend/dist/* deploy/frontend/
cp -r backend/* deploy/backend/
rm -rf deploy/backend/uploads
mkdir -p deploy/backend/uploads

# 5. 创建环境变量文件
echo "创建环境变量文件..."
cp backend/.env.example deploy/backend/.env

# 6. 创建启动脚本
echo "创建启动脚本..."
cat > deploy/start.sh << EOF
#!/bin/bash

# 启动防割韭菜Agent服务

echo "启动后端服务..."
cd backend
npm start &

BACKEND_PID=$!

echo "启动前端服务..."
cd ../frontend
python3 -m http.server 5173 &

FRONTEND_PID=$!

echo "服务已启动！"
echo "后端服务PID: $BACKEND_PID"
echo "前端服务PID: $FRONTEND_PID"
echo "前端访问地址: http://localhost:5173"
echo "后端API地址: http://localhost:3001"

# 等待用户输入
read -p "按Enter键停止服务..."

# 停止服务
echo "停止服务..."
kill $BACKEND_PID $FRONTEND_PID
echo "服务已停止"
EOF

chmod +x deploy/start.sh

# 7. 创建监控脚本
echo "创建监控脚本..."
cat > deploy/monitor.sh << EOF
#!/bin/bash

# 防割韭菜Agent监控脚本

echo "监控防割韭菜Agent服务..."

while true; do
  echo "$(date '+%Y-%m-%d %H:%M:%S') - 监控服务状态"
  
  # 检查后端服务
  if curl -s http://localhost:3001/api/health | grep -q "ok"; then
    echo "后端服务: 正常"
  else
    echo "后端服务: 异常"
  fi
  
  # 检查前端服务
  if curl -s http://localhost:5173 | grep -q "防割韭菜Agent"; then
    echo "前端服务: 正常"
  else
    echo "前端服务: 异常"
  fi
  
  echo "------------------------"
  sleep 60

done
EOF

chmod +x deploy/monitor.sh

# 8. 创建应急响应计划
echo "创建应急响应计划..."
cat > deploy/emergency_plan.md << EOF
# 防割韭菜Agent应急响应计划

## 1. 事件类型

### 1.1 系统故障
- **症状**: 前端或后端服务无法访问
- **应对措施**:
  - 检查服务进程是否运行
  - 查看服务日志
  - 重启服务
  - 如问题持续，联系开发团队

### 1.2 安全事件
- **症状**: 可疑的API调用、异常的文件上传
- **应对措施**:
  - 检查服务器日志
  - 暂时关闭服务
  - 分析安全事件
  - 修复漏洞
  - 恢复服务

### 1.3 性能问题
- **症状**: 响应时间过长、系统卡顿
- **应对措施**:
  - 检查服务器资源使用情况
  - 优化数据库查询
  - 增加服务器资源
  - 实施缓存策略

## 2. 应急响应流程

### 2.1 检测与报告
- 系统监控发现异常
- 用户报告问题
- 自动报警触发

### 2.2 响应与处理
- 确认事件类型
- 实施相应的应对措施
- 记录处理过程

### 2.3 恢复与验证
- 验证系统恢复正常
- 进行安全扫描
- 测试核心功能

### 2.4 总结与改进
- 分析事件原因
- 提出改进措施
- 更新应急响应计划

## 3. 联系人信息

- 系统管理员: admin@example.com
- 开发团队: dev@example.com
- 紧急联系电话: 123-456-7890

## 4. 定期维护

- 每周检查系统日志
- 每月进行安全扫描
- 每季度更新依赖包
- 每年进行系统架构评估
EOF

echo "部署准备完成！"
echo "部署目录: $(pwd)/deploy"
echo "启动服务: cd deploy && ./start.sh"
echo "监控服务: cd deploy && ./monitor.sh"
echo "应急响应计划: deploy/emergency_plan.md"
