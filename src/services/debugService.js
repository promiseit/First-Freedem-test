// 调试服务

class DebugService {
  constructor() {
    this.output = '';
    this.error = '';
  }

  // 执行代码
  executeCode(code) {
    try {
      // 重置输出
      this.output = '';
      this.error = '';

      // 重定向控制台输出
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;

      // 捕获输出
      console.log = (message) => {
        this.output += `${message}\n`;
        originalConsoleLog(message);
      };

      console.error = (message) => {
        this.error += `${message}\n`;
        originalConsoleError(message);
      };

      console.warn = (message) => {
        this.output += `Warning: ${message}\n`;
        originalConsoleWarn(message);
      };

      // 执行代码
      const startTime = performance.now();
      
      // 使用Function构造函数执行代码，提供安全的执行环境
      const func = new Function('console', code);
      func(console);
      
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);

      // 恢复原始控制台方法
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;

      // 添加执行时间
      this.output += `\n执行时间: ${executionTime}ms`;

      return {
        success: true,
        output: this.output,
        error: this.error
      };
    } catch (error) {
      // 恢复原始控制台方法
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;

      return {
        success: false,
        output: this.output,
        error: error.message
      };
    }
  }

  // 安全检查
  securityCheck(code) {
    // 简单的安全检查，防止恶意代码
    const dangerousPatterns = [
      'eval(',
      'new Function(',
      'document.write(',
      'document.body.innerHTML',
      'localStorage.clear(',
      'sessionStorage.clear(',
      'window.open(',
      'fetch(',
      'XMLHttpRequest',
      'import(',
      'require(',
      'process.env',
      'globalThis',
      'window.location',
      'document.cookie'
    ];

    for (const pattern of dangerousPatterns) {
      if (code.includes(pattern)) {
        return {
          safe: false,
          reason: `检测到潜在危险代码: ${pattern}`
        };
      }
    }

    return {
      safe: true,
      reason: '代码安全'
    };
  }
}

// 导出单例
export default new DebugService();