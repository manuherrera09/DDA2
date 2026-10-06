import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ColaTelemarketerPage from './pages/ColaTelemarketerPage'
import NotFoundPage from './pages/NotFoundPage'
import PreformularioPage from './pages/PreformularioPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PreformularioPage />} />
        <Route path="/preformulario" element={<PreformularioPage />} />
        <Route path="/cola-telemarketer" element={<ColaTelemarketerPage />} />
        <Route path="/cola" element={<ColaTelemarketerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
