#!/bin/bash

# 防割韭菜Agent监控脚本

echo "监控防割韭菜Agent服务..."

while true; do
  echo "2026-04-15 03:31:28 - 监控服务状态"
  
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
