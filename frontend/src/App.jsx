import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      content: '您好！我是防割韭菜Agent，一个勇于谏言的大臣。我会帮助您识别投资和交易中的潜在风险，防止您落入陷阱。请随时向我咨询任何问题，我会保持平和专业的态度为您服务。'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (inputValue.trim() === '') return

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      content: inputValue
    }

    setMessages([...messages, newMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await fetch('http://localhost:3001/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: inputValue })
      })

      const data = await response.json()
      if (data.success) {
        const aiResponse = {
          id: Date.now() + 1,
          sender: 'agent',
          content: data.message
        }
        setMessages(prev => [...prev, aiResponse])
      } else {
        const errorResponse = {
          id: Date.now() + 1,
          sender: 'agent',
          content: '抱歉，我暂时无法处理您的请求，请稍后再试。'
        }
        setMessages(prev => [...prev, errorResponse])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorResponse = {
        id: Date.now() + 1,
        sender: 'agent',
        content: '抱歉，网络连接失败，请稍后再试。'
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const newMessage = {
        id: Date.now(),
        sender: 'user',
        content: '上传了图片',
        image: URL.createObjectURL(file)
      }
      setMessages([...messages, newMessage])
      setIsTyping(true)

      try {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch('http://localhost:3001/api/upload/image', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        if (data.success) {
          const aiResponse = {
            id: Date.now() + 1,
            sender: 'agent',
            content: data.message
          }
          setMessages(prev => [...prev, aiResponse])
        } else {
          const errorResponse = {
            id: Date.now() + 1,
            sender: 'agent',
            content: '抱歉，我暂时无法处理您上传的图片，请稍后再试。'
          }
          setMessages(prev => [...prev, errorResponse])
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        const errorResponse = {
          id: Date.now() + 1,
          sender: 'agent',
          content: '抱歉，网络连接失败，请稍后再试。'
        }
        setMessages(prev => [...prev, errorResponse])
      } finally {
        setIsTyping(false)
      }
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const newMessage = {
        id: Date.now(),
        sender: 'user',
        content: `上传了文件: ${file.name}`
      }
      setMessages([...messages, newMessage])
      setIsTyping(true)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('http://localhost:3001/api/upload/file', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        if (data.success) {
          const aiResponse = {
            id: Date.now() + 1,
            sender: 'agent',
            content: data.message
          }
          setMessages(prev => [...prev, aiResponse])
        } else {
          const errorResponse = {
            id: Date.now() + 1,
            sender: 'agent',
            content: `抱歉，我暂时无法处理您上传的文件 ${file.name}，请稍后再试。`
          }
          setMessages(prev => [...prev, errorResponse])
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        const errorResponse = {
          id: Date.now() + 1,
          sender: 'agent',
          content: '抱歉，网络连接失败，请稍后再试。'
        }
        setMessages(prev => [...prev, errorResponse])
      } finally {
        setIsTyping(false)
      }
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>防割韭菜Agent</h1>
        <p>勇于谏言的大臣，防止您落入陷阱</p>
      </header>
      
      <main className="chat-container">
        <div className="messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                {message.image && <img src={message.image} alt="Uploaded image" className="message-image" />}
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message agent typing">
              <div className="message-content">
                <p>思考中...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-area">
          <div className="input-controls">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="upload-button">
              📷
            </label>
            
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={handleFileUpload}
              className="file-input"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="upload-button">
              📎
            </label>
          </div>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="请输入您的问题或描述..."
            className="text-input"
          />
          
          <button onClick={handleSend} className="send-button">
            发送
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
