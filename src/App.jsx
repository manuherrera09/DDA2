import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RequireAuth from './auth/RequireAuth'
import { AuthProvider } from './auth/AuthContext'
import ColaTelemarketerPage from './pages/ColaTelemarketerPage'
import MonitorPage from './pages/MonitorPage'
import NotFoundPage from './pages/NotFoundPage'
import PreformularioPage from './pages/PreformularioPage'

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PreformularioPage />} />
        <Route path="/preformulario" element={<PreformularioPage />} />
        <Route path="/cola-telemarketer" element={<RequireAuth><ColaTelemarketerPage /></RequireAuth>} />
        <Route path="/cola" element={<RequireAuth><ColaTelemarketerPage /></RequireAuth>} />
        <Route path="/monitor" element={<MonitorPage />} />
        <Route path="/health" element={<MonitorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
