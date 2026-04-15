import { useState } from 'react'
import './App.css'
import localStorageService from './services/localStorageService'
import debugService from './services/debugService'
import aiModelService from './services/aiModelService'

function App() {
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [savePath, setSavePath] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiOperation, setAiOperation] = useState('generate')
  const [aiLoading, setAiLoading] = useState(false)
  const [showFileModal, setShowFileModal] = useState(false)
  const [files, setFiles] = useState([])
  const [fileLoading, setFileLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  // 处理保存路径变化
  const handleSavePathChange = (e) => {
    const path = e.target.value
    setSavePath(path)
    localStorageService.setSavePath(path)
  }

  // 处理保存按钮点击
  const handleSave = async () => {
    try {
      setSaveStatus('保存中...')
      const success = await localStorageService.saveFile('code.js', code)
      if (success) {
        setSaveStatus('保存成功！')
        // 3秒后清除状态
        setTimeout(() => setSaveStatus(''), 3000)
      }
    } catch (error) {
      setSaveStatus(`保存失败: ${error.message}`)
      // 3秒后清除状态
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  // 处理运行按钮点击
  const handleRun = () => {
    // 安全检查
    const securityCheckResult = debugService.securityCheck(code)
    if (!securityCheckResult.safe) {
      setOutput(`安全警告: ${securityCheckResult.reason}\n请确认代码安全性后再执行`)
      return
    }

    // 执行代码
    const result = debugService.executeCode(code)
    if (result.success) {
      setOutput(result.output)
    } else {
      setOutput(`执行错误: ${result.error}`)
    }
  }

  // 处理大模型操作
  const handleAiOperation = async () => {
    if (!aiPrompt && aiOperation === 'generate') {
      setOutput('请输入生成代码的提示')
      return
    }

    setAiLoading(true)
    try {
      let result
      switch (aiOperation) {
        case 'generate':
          result = await aiModelService.generateCode(aiPrompt)
          if (result.success) {
            setCode(result.code)
            setOutput('代码生成成功！')
          } else {
            setOutput(`生成代码失败: ${result.error}`)
          }
          break
        case 'analyze':
          if (!code) {
            setOutput('请输入要分析的代码')
            return
          }
          result = await aiModelService.analyzeCode(code)
          if (result.success) {
            const analysis = result.analysis
            let analysisOutput = `代码分析结果:\n\n`
            analysisOutput += `复杂度: ${analysis.complexity}\n\n`
            if (analysis.potentialIssues.length > 0) {
              analysisOutput += `潜在问题:\n${analysis.potentialIssues.map(issue => `- ${issue}`).join('\n')}\n\n`
            }
            if (analysis.suggestions.length > 0) {
              analysisOutput += `建议:\n${analysis.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}\n\n`
            }
            if (analysis.optimizationTips.length > 0) {
              analysisOutput += `优化建议:\n${analysis.optimizationTips.map(tip => `- ${tip}`).join('\n')}`
            }
            setOutput(analysisOutput)
          } else {
            setOutput(`分析代码失败: ${result.error}`)
          }
          break
        case 'complete':
          if (!code) {
            setOutput('请输入要补全的代码')
            return
          }
          result = await aiModelService.completeCode(code, aiPrompt)
          if (result.success) {
            setCode(result.code)
            setOutput('代码补全成功！')
          } else {
            setOutput(`代码补全失败: ${result.error}`)
          }
          break
        case 'fix':
          if (!code) {
            setOutput('请输入要修复的代码')
            return
          }
          result = await aiModelService.fixCode(code)
          if (result.success) {
            setCode(result.code)
            setOutput('代码修复成功！')
          } else {
            setOutput(`修复代码失败: ${result.error}`)
          }
          break
        default:
          setOutput('无效的操作类型')
      }
    } catch (error) {
      setOutput(`操作失败: ${error.message}`)
    } finally {
      setAiLoading(false)
      setShowAiModal(false)
    }
  }

  // 加载文件列表
  const loadFiles = async () => {
    setFileLoading(true)
    try {
      const fileList = await localStorageService.listFiles()
      setFiles(fileList)
    } catch (error) {
      setOutput(`加载文件列表失败: ${error.message}`)
    } finally {
      setFileLoading(false)
    }
  }

  // 打开文件
  const openFile = async (filename) => {
    try {
      const content = await localStorageService.readFile(filename)
      setCode(content)
      setSelectedFile(filename)
      setOutput(`文件 ${filename} 打开成功！`)
      setShowFileModal(false)
    } catch (error) {
      setOutput(`打开文件失败: ${error.message}`)
    }
  }

  // 删除文件
  const deleteFile = async (filename) => {
    if (!confirm(`确定要删除文件 ${filename} 吗？`)) {
      return
    }

    try {
      await localStorageService.deleteFile(filename)
      setOutput(`文件 ${filename} 删除成功！`)
      // 刷新文件列表
      await loadFiles()
    } catch (error) {
      setOutput(`删除文件失败: ${error.message}`)
    }
  }

  // 处理文件管理按钮点击
  const handleFileManagement = async () => {
    await loadFiles()
    setShowFileModal(true)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trae SOLO 网页版</h1>
        <div className="header-actions">
          <button onClick={handleSave}>保存</button>
          <button onClick={handleRun}>运行</button>
          <button onClick={() => setShowAiModal(true)}>大模型</button>
          <button onClick={handleFileManagement}>文件管理</button>
        </div>
      </header>
      <main className="app-main">
        <div className="code-editor">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="在此输入代码..."
          />
        </div>
        <div className="debug-console">
          <h3>调试输出</h3>
          <div className="console-output">
            {output}
            {saveStatus && (
              <div className={`save-status ${saveStatus.includes('成功') ? 'success' : saveStatus.includes('失败') ? 'error' : ''}`}>
                {saveStatus}
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="app-footer">
        <div className="save-path">
          <label>保存路径: </label>
          <input
            type="text"
            value={savePath}
            onChange={handleSavePathChange}
            placeholder="输入保存路径..."
          />
        </div>
      </footer>

      {/* 大模型操作对话框 */}
      {showAiModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>大模型操作</h2>
            <div className="modal-content">
              <div className="form-group">
                <label>操作类型:</label>
                <select value={aiOperation} onChange={(e) => setAiOperation(e.target.value)}>
                  <option value="generate">生成代码</option>
                  <option value="analyze">分析代码</option>
                  <option value="complete">代码补全</option>
                  <option value="fix">错误修复</option>
                </select>
              </div>
              <div className="form-group">
                <label>{aiOperation === 'generate' ? '生成提示:' : aiOperation === 'complete' ? '补全上下文:' : '备注:'}</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={aiOperation === 'generate' ? '请输入代码生成提示，例如：创建一个排序算法' : aiOperation === 'complete' ? '请输入补全上下文，例如：创建一个函数' : '可选备注'}
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAiModal(false)}>取消</button>
              <button onClick={handleAiOperation} disabled={aiLoading}>
                {aiLoading ? '处理中...' : '执行'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 文件管理对话框 */}
      {showFileModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>文件管理</h2>
            <div className="modal-content">
              {fileLoading ? (
                <div className="loading">加载中...</div>
              ) : files.length === 0 ? (
                <div className="no-files">暂无文件</div>
              ) : (
                <div className="file-list">
                  {files.map((file) => (
                    <div key={file.name} className="file-item">
                      <div className="file-info">
                        <span className={file.isDirectory ? 'directory-icon' : 'file-icon'}>
                          {file.isDirectory ? '📁' : '📄'}
                        </span>
                        <span>{file.name}</span>
                      </div>
                      <div className="file-actions">
                        {!file.isDirectory && (
                          <>
                            <button onClick={() => openFile(file.name)} className="file-button open">打开</button>
                            <button onClick={() => deleteFile(file.name)} className="file-button delete">删除</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowFileModal(false)}>关闭</button>
              <button onClick={loadFiles} disabled={fileLoading}>
                {fileLoading ? '刷新中...' : '刷新'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App