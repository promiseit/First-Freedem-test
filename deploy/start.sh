#!/bin/bash

# 启动防割韭菜Agent服务

echo "启动后端服务..."
cd backend
npm start &

BACKEND_PID=

echo "启动前端服务..."
cd ../frontend
python3 -m http.server 5173 &

FRONTEND_PID=

echo "服务已启动！"
echo "后端服务PID: "
echo "前端服务PID: "
echo "前端访问地址: http://localhost:5173"
echo "后端API地址: http://localhost:3001"

# 等待用户输入
read -p "按Enter键停止服务..."

# 停止服务
echo "停止服务..."
kill  
echo "服务已停止"
