import axiosClient, { authHttp } from './axiosClient'
import { guardarTokens, limpiarTokens, obtenerTokens } from '../auth/sesion'

// POST /api/auth/login -> { access_token, refresh_token }. Guarda la sesión.
// Errores relevantes: 401 (credenciales o usuario inactivo) y 429 con Retry-After
// (demasiados intentos: hay que esperar).
export async function iniciarSesion(email, password) {
  const { data } = await authHttp.post('/auth/login', { email: email.trim(), password })
  guardarTokens(data)
  return data
}

// POST /api/auth/logout: el orquestador invalida el token en el acto. Si el pedido
// falla (sin red, servicio caído) igual se cierra la sesión localmente.
export async function cerrarSesion() {
  const sesion = obtenerTokens()
  try {
    if (sesion) {
      await axiosClient.post('/auth/logout', { refresh_token: sesion.refreshToken })
    }
  } catch {
    // Se ignora: lo importante es que el navegador deje de tener el token.
  } finally {
    limpiarTokens()
  }
}

// Segundos de espera que indica el servidor tras un 429 (header Retry-After).
export function segundosDeEspera(error) {
  const valor = Number(error?.response?.headers?.['retry-after'])
  return Number.isFinite(valor) && valor > 0 ? valor : null
}
