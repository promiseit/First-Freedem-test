import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 配置构建输出
    outDir: 'dist',
    assetsDir: 'assets',
    // 生成的静态资源文件名包含哈希，用于缓存
    assetsInlineLimit: 4096, // 4kb以下的资源内联
    cssCodeSplit: true, // 拆分CSS
    sourcemap: false, // 生产环境不生成sourcemap
    // 优化配置
    rollupOptions: {
      output: {
        // 配置代码分割
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          echarts: ['echarts', 'echarts-for-react'],
        }
      }
    }
  },
  // 开发服务器配置
  server: {
    port: 3000,
    open: true
  }
})