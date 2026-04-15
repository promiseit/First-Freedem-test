// 本地存储服务

class LocalStorageService {
  constructor() {
    this.rootDir = null;
    this.savePath = '';
    this.fileCache = new Map(); // 文件缓存
    this.cacheExpiry = 5 * 60 * 1000; // 缓存过期时间：5分钟
  }

  // 请求文件系统访问权限
  async requestFileSystemAccess() {
    try {
      // 检查浏览器兼容性
      if (!window.showDirectoryPicker) {
        throw new Error('您的浏览器不支持File System Access API，请使用Chrome 86+或Edge 86+');
      }
      
      // 使用File System Access API
      this.rootDir = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });
      return true;
    } catch (error) {
      console.error('获取文件系统访问权限失败:', error);
      return false;
    }
  }

  // 设置保存路径
  setSavePath(path) {
    this.savePath = path;
  }

  // 获取保存路径
  getSavePath() {
    return this.savePath;
  }

  // 保存文件
  async saveFile(filename, content) {
    if (!this.rootDir) {
      const success = await this.requestFileSystemAccess();
      if (!success) {
        throw new Error('无法获取文件系统访问权限');
      }
    }

    try {
      // 处理保存路径
      let currentDir = this.rootDir;
      const pathParts = this.savePath.split('/').filter(part => part);
      
      // 遍历创建目录
      for (const part of pathParts) {
        try {
          currentDir = await currentDir.getDirectoryHandle(part, { create: true });
        } catch (error) {
          console.error('创建目录失败:', error);
          throw new Error('创建目录失败');
        }
      }

      // 创建或覆盖文件
      const fileHandle = await currentDir.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      // 更新缓存
      this.fileCache.set(filename, {
        content: content,
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('保存文件失败:', error);
      throw new Error('保存文件失败');
    }
  }

  // 读取文件
  async readFile(filename) {
    // 检查缓存
    const cached = this.fileCache.get(filename);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached.content;
    }

    if (!this.rootDir) {
      const success = await this.requestFileSystemAccess();
      if (!success) {
        throw new Error('无法获取文件系统访问权限');
      }
    }

    try {
      // 处理保存路径
      let currentDir = this.rootDir;
      const pathParts = this.savePath.split('/').filter(part => part);
      
      // 遍历进入目录
      for (const part of pathParts) {
        try {
          currentDir = await currentDir.getDirectoryHandle(part);
        } catch (error) {
          console.error('访问目录失败:', error);
          throw new Error('访问目录失败');
        }
      }

      // 读取文件
      const fileHandle = await currentDir.getFileHandle(filename);
      const file = await fileHandle.getFile();
      const content = await file.text();

      // 更新缓存
      this.fileCache.set(filename, {
        content: content,
        timestamp: Date.now()
      });

      return content;
    } catch (error) {
      console.error('读取文件失败:', error);
      throw new Error('读取文件失败');
    }
  }

  // 列出文件
  async listFiles() {
    if (!this.rootDir) {
      const success = await this.requestFileSystemAccess();
      if (!success) {
        throw new Error('无法获取文件系统访问权限');
      }
    }

    try {
      // 处理保存路径
      let currentDir = this.rootDir;
      const pathParts = this.savePath.split('/').filter(part => part);
      
      // 遍历进入目录
      for (const part of pathParts) {
        try {
          currentDir = await currentDir.getDirectoryHandle(part);
        } catch (error) {
          // 目录不存在，返回空列表
          return [];
        }
      }

      // 列出文件
      const files = [];
      for await (const entry of currentDir.values()) {
        files.push({
          name: entry.name,
          isDirectory: entry.kind === 'directory'
        });
      }

      return files;
    } catch (error) {
      console.error('列出文件失败:', error);
      throw new Error('列出文件失败');
    }
  }

  // 删除文件
  async deleteFile(filename) {
    if (!this.rootDir) {
      const success = await this.requestFileSystemAccess();
      if (!success) {
        throw new Error('无法获取文件系统访问权限');
      }
    }

    try {
      // 处理保存路径
      let currentDir = this.rootDir;
      const pathParts = this.savePath.split('/').filter(part => part);
      
      // 遍历进入目录
      for (const part of pathParts) {
        try {
          currentDir = await currentDir.getDirectoryHandle(part);
        } catch (error) {
          console.error('访问目录失败:', error);
          throw new Error('访问目录失败');
        }
      }

      // 删除文件
      await currentDir.removeEntry(filename);

      // 清除缓存
      this.fileCache.delete(filename);

      return true;
    } catch (error) {
      console.error('删除文件失败:', error);
      throw new Error('删除文件失败');
    }
  }
}

// 导出单例
export default new LocalStorageService();