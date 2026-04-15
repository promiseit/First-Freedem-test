import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import llmService from '../services/llmService';

const ChatAgent = () => {
  const { user, verificationStatus } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('openai');
  const messagesEndRef = useRef(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化消息
  useEffect(() => {
    const initialMessage = {
      role: 'assistant',
      content: '你好！我是防割韭菜Agent，专门帮你识别投资陷阱、电信诈骗和非理性消费。有什么可以帮你的吗？'
    };
    setMessages([initialMessage]);
  }, []);

  // 发送消息
  const handleSend = async () => {
    if (!input.trim()) return;

    // 添加用户消息
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 调用大模型API
      const response = await llmService.chat([...messages, userMessage], {
        model,
        temperature: 0.7,
        maxTokens: 1000
      });

      // 添加助手消息
      const assistantMessage = {
        role: 'assistant',
        content: response.content
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: '抱歉，我遇到了一些问题，请稍后再试。'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理回车键发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '800px', margin: '0 auto' }}>
      {/* 头部 */}
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f5f5f5', 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2>防割韭菜Agent</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>模型:</span>
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            style={{ padding: '0.25rem', borderRadius: '4px' }}
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="mistral">Mistral</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>
      </div>

      {/* 消息列表 */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1rem',
        backgroundColor: '#fafafa'
      }}>
        {messages.map((message, index) => (
          <div 
            key={index} 
            style={{
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div 
              style={{
                maxWidth: '70%',
                padding: '0.75rem',
                borderRadius: '1rem',
                backgroundColor: message.role === 'user' ? '#e3f2fd' : '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#666', 
                marginBottom: '0.25rem'
              }}>
                {message.role === 'user' ? '你' : '防割韭菜Agent'}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ 
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'row'
          }}>
            <div 
              style={{
                maxWidth: '70%',
                padding: '0.75rem',
                borderRadius: '1rem',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#666', 
                marginBottom: '0.25rem'
              }}>
                防割韭菜Agent
              </div>
              <div>思考中...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f5f5f5', 
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入你的问题..."
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            resize: 'none',
            minHeight: '80px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            alignSelf: 'flex-end'
          }}
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>

      {/* 提示信息 */}
      <div style={{ 
        padding: '0.5rem', 
        backgroundColor: '#fff3cd', 
        borderTop: '1px solid #ffeeba',
        fontSize: '0.75rem',
        color: '#856404',
        textAlign: 'center'
      }}>
        💡 提示：你可以咨询投资风险、电信诈骗防范、消费建议等问题
      </div>
    </div>
  );
};

export default ChatAgent;