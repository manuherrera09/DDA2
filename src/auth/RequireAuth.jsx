import LoginPage from '../pages/LoginPage'
import { useAuth } from './AuthContext'

// Protege una sección: sin sesión muestra el login en la misma URL, y al entrar
// muestra la sección. No decide permisos (eso lo hace el orquestador).
function RequireAuth({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <LoginPage />
}

export default RequireAuth
