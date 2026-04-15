import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import { lazy, Suspense } from 'react'

// 实现代码分割和懒加载
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const InvestmentRiskAnalysis = lazy(() => import('./pages/InvestmentRiskAnalysis'))
const Remittance = lazy(() => import('./pages/Remittance'))
const ConsumptionPlan = lazy(() => import('./pages/ConsumptionPlan'))
const FinancialAnalysis = lazy(() => import('./pages/FinancialAnalysis'))
const RiskAssessment = lazy(() => import('./pages/RiskAssessment'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <header className="header">
            <nav className="nav">
              <Link to="/">首页</Link>
              <Link to="/about">关于</Link>
              <Link to="/investment-risk">投资风险分析</Link>
              <Link to="/remittance">汇款信息输入</Link>
              <Link to="/consumption-plan">消费计划</Link>
              <Link to="/financial-analysis">财务分析</Link>
              <Link to="/risk-assessment">风险评估</Link>
              <AuthLinks />
            </nav>
          </header>
          
          <main className="main">
            <Suspense fallback={<div>加载中...</div>}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<PrivateRoute />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/investment-risk" element={<InvestmentRiskAnalysis />} />
                  <Route path="/remittance" element={<Remittance />} />
                  <Route path="/consumption-plan" element={<ConsumptionPlan />} />
                  <Route path="/financial-analysis" element={<FinancialAnalysis />} />
                  <Route path="/risk-assessment" element={<RiskAssessment />} />
                </Route>
              </Routes>
            </Suspense>
          </main>
          
          <footer className="footer">
            <p>© 2026 React 项目</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  )
}

function AuthLinks() {
  const { user, logout } = useAuth()
  
  if (user) {
    return (
      <>
        <span>欢迎, {user.username}</span>
        <button 
          onClick={logout}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'blue', 
            textDecoration: 'underline', 
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          退出登录
        </button>
      </>
    )
  } else {
    return (
      <>
        <Link to="/login">登录</Link>
        <Link to="/register">注册</Link>
      </>
    )
  }
}

export default App