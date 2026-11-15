import axios from 'axios'
import { avisarSesionCerrada, guardarTokens, limpiarTokens, obtenerTokens } from '../auth/sesion'

// Todo el front habla con el orquestador (API Gateway): `/api/{recurso}/**`.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Cliente sin interceptores para login/refresh/logout: así un 401 de estos
// pedidos no dispara otro refresh en bucle.
export const authHttp = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Si se llama a esta ruta no hay que mandar el token (son las públicas de auth).
const RUTAS_DE_AUTH = ['/auth/login', '/auth/refresh']

axiosClient.interceptors.request.use((config) => {
  const sesion = obtenerTokens()
  const esAuthPublica = RUTAS_DE_AUTH.some((ruta) => config.url?.startsWith(ruta))
  if (sesion && !esAuthPublica) {
    config.headers.Authorization = `Bearer ${sesion.accessToken}`
  }
  return config
})

// Varios pedidos pueden fallar a la vez por token vencido: se renueva una sola
// vez y todos esperan el mismo resultado (el refresh token rota en cada uso, así
// que dos refresh en paralelo invalidarían al segundo).
let renovacionEnCurso = null

function renovarSesion() {
  if (!renovacionEnCurso) {
    const sesion = obtenerTokens()
    if (!sesion) return Promise.reject(new Error('Sin sesión'))
    renovacionEnCurso = authHttp
      .post('/auth/refresh', { refresh_token: sesion.refreshToken })
      .then(({ data }) => {
        guardarTokens(data)
        return data.access_token
      })
      .finally(() => {
        renovacionEnCurso = null
      })
  }
  return renovacionEnCurso
}

axiosClient.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const { response, config } = error
    if (response?.status !== 401 || !config) return Promise.reject(error)

    const codigo = response.data?.codigo
    const esAuthPublica = RUTAS_DE_AUTH.some((ruta) => config.url?.startsWith(ruta))
    if (esAuthPublica) return Promise.reject(error)

    // Token vencido: renovar y repetir el pedido una única vez.
    if (codigo === 'TOKEN_EXPIRADO' && !config._reintentado) {
      try {
        const nuevoToken = await renovarSesion()
        config._reintentado = true
        config.headers.Authorization = `Bearer ${nuevoToken}`
        return axiosClient(config)
      } catch {
        limpiarTokens()
        avisarSesionCerrada()
        return Promise.reject(error)
      }
    }

    // Token inválido/revocado o ausente: la sesión no sirve, volver al login.
    // (Una ruta pública que devuelva 401 por otra causa no pasa por acá porque
    // no manda token; solo reaccionamos si había una sesión guardada.)
    if (['TOKEN_INVALIDO', 'TOKEN_REVOCADO', 'NO_AUTENTICADO'].includes(codigo) && obtenerTokens()) {
      limpiarTokens()
      avisarSesionCerrada()
    }
    return Promise.reject(error)
  },
)

export default axiosClient
