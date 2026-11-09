import axios from 'axios'

const VITE_MONITOR_API_URL = import.meta.env.VITE_MONITOR_API_URL || 'http://localhost:8085'
const VITE_VEHICULOS_API_URL = import.meta.env.VITE_VEHICULOS_API_URL || 'http://localhost:8083'
const VITE_CLIENTES_API_URL = import.meta.env.VITE_CLIENTES_API_URL || 'http://localhost:8082'
const VITE_LEADS_API_URL = import.meta.env.VITE_LEADS_API_URL || 'http://localhost:8000'
const VITE_CALIFICACION_API_URL = import.meta.env.VITE_CALIFICACION_API_URL || 'http://localhost:8084'

const monitorClient = axios.create({
  baseURL: VITE_MONITOR_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 25000,
})

// Definición de servicios para sondeo directo de respaldo cuando el microservicio
// monitor (:8085) no está corriendo localmente.
const SERVICIOS_DIRECTOS = [
  {
    servicio: 'vehiculos',
    nombreMostrar: 'Microservicio de Vehículos',
    urlBase: VITE_VEHICULOS_API_URL,
    rutas: ['/actuator/health', '/vehiculos', '/v3/api-docs'],
  },
  {
    servicio: 'clientes',
    nombreMostrar: 'Microservicio de Clientes',
    urlBase: VITE_CLIENTES_API_URL,
    rutas: ['/actuator/health', '/v3/api-docs'],
  },
  {
    servicio: 'leads',
    nombreMostrar: 'Microservicio de Leads',
    urlBase: VITE_LEADS_API_URL,
    rutas: ['/health', '/openapi.json', '/leads'],
  },
  {
    servicio: 'calificacion',
    nombreMostrar: 'Microservicio de Calificación',
    urlBase: VITE_CALIFICACION_API_URL,
    rutas: ['/actuator/health', '/v3/api-docs'],
  },
]

const historialLocal = []
const MAX_HISTORIAL_LOCAL = 120
const UMBRAL_DEGRADADO_MS = 1000

function registrarEnHistorialLocal(items) {
  const lista = Array.isArray(items) ? items : [items]
  lista.forEach((item) => {
    if (!item) return
    historialLocal.unshift({
      ...item,
      id: `${item.servicio}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    })
  })
  if (historialLocal.length > MAX_HISTORIAL_LOCAL) {
    historialLocal.length = MAX_HISTORIAL_LOCAL
  }
}

export function normalizeEstadoServicio(item) {
  if (!item) return null
  return {
    id: item.id ?? `${item.servicio}-${item.ultimaVerificacion || Date.now()}`,
    servicio: item.servicio,
    nombreMostrar: item.nombreMostrar ?? item.nombre_mostrar ?? item.servicio,
    estado: item.estado || 'DOWN',
    latenciaMs: Number(item.latenciaMs ?? item.latencia_ms ?? 0),
    ultimaVerificacion: item.ultimaVerificacion ?? item.ultima_verificacion ?? new Date().toISOString(),
    detalle: item.detalle || '',
    urlConsultada: item.urlConsultada ?? item.url_consultada ?? '',
    codigoHttp: item.codigoHttp ?? item.codigo_http ?? null,
    tipoVerificacion: item.tipoVerificacion ?? item.tipo_verificacion ?? 'ACTUATOR_HEALTH',
  }
}

async function sondearServicioDirecto(def, timeoutMs = 4500) {
  const base = (def.urlBase || '').replace(/\/+$/, '')
  let ultimoError = 'Sin conexión con el servicio'
  let ultimaUrl = `${base}${def.rutas[0] || ''}`
  let ultimaLatencia = 0

  for (const ruta of def.rutas) {
    const url = `${base}${ruta}`
    ultimaUrl = url
    const inicio = performance.now()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json, text/plain, */*' },
      })
      clearTimeout(timer)
      const latenciaMs = Math.max(1, Math.round(performance.now() - inicio))
      ultimaLatencia = latenciaMs

      if (response.status === 404 && ruta !== def.rutas[def.rutas.length - 1]) {
        continue
      }

      let estado = 'UP'
      let detalle = `Operativo (HTTP ${response.status} en ${latenciaMs} ms)`

      if (response.status >= 500) {
        estado = 'DOWN'
        detalle = `Servicio reporta fallo (HTTP ${response.status})`
      } else if (response.status >= 400) {
        estado = 'DEGRADADO'
        detalle = `Respuesta parcial (HTTP ${response.status} en ${latenciaMs} ms)`
      } else if (latenciaMs >= UMBRAL_DEGRADADO_MS) {
        estado = 'DEGRADADO'
        detalle = `Respuesta lenta (${latenciaMs} ms >= ${UMBRAL_DEGRADADO_MS} ms)`
      }

      return normalizeEstadoServicio({
        servicio: def.servicio,
        nombreMostrar: def.nombreMostrar,
        estado,
        latenciaMs,
        ultimaVerificacion: new Date().toISOString(),
        detalle,
        urlConsultada: url,
        codigoHttp: response.status,
        tipoVerificacion: 'DIRECTO_HTTP',
      })
    } catch (err) {
      clearTimeout(timer)
      ultimaLatencia = Math.max(1, Math.round(performance.now() - inicio))
      ultimoError = err?.name === 'AbortError'
        ? `Tiempo de espera agotado (${timeoutMs} ms)`
        : 'Sin conexión (servicio apagado o hibernado)'
    }
  }

  return normalizeEstadoServicio({
    servicio: def.servicio,
    nombreMostrar: def.nombreMostrar,
    estado: 'DOWN',
    latenciaMs: ultimaLatencia,
    ultimaVerificacion: new Date().toISOString(),
    detalle: ultimoError,
    urlConsultada: ultimaUrl,
    codigoHttp: null,
    tipoVerificacion: 'DIRECTO_HTTP',
  })
}

async function sondearTodosDirecto(nombreServicio = null, timeoutMs = 4500) {
  const objetivos = nombreServicio
    ? SERVICIOS_DIRECTOS.filter((s) => s.servicio.toLowerCase() === nombreServicio.toLowerCase())
    : SERVICIOS_DIRECTOS

  const resultados = await Promise.all(
    objetivos.map((def) => sondearServicioDirecto(def, timeoutMs)),
  )
  registrarEnHistorialLocal(resultados)
  return resultados
}

/**
 * GET /monitor/estado -> Obtiene el estado actual de los servicios.
 * Si el microservicio monitor no responde, realiza el sondeo directo de respaldo.
 */
export async function obtenerEstadoMonitor({ forzar = false } = {}) {
  try {
    const { data } = await monitorClient.get('/monitor/estado', {
      params: { forzar },
    })
    const servicios = Array.isArray(data) ? data.map(normalizeEstadoServicio) : []
    return { servicios, fuente: 'MONITOR_SERVICE' }
  } catch {
    const servicios = await sondearTodosDirecto()
    return { servicios, fuente: 'DIRECTO_FRONTEND' }
  }
}

/**
 * GET /monitor/historial?servicio=... -> Obtiene el historial de verificaciones.
 */
export async function obtenerHistorialMonitor({ servicio, limite = 30 } = {}) {
  try {
    const { data } = await monitorClient.get('/monitor/historial', {
      params: { servicio: servicio || undefined, limite },
    })
    return Array.isArray(data) ? data.map(normalizeEstadoServicio) : []
  } catch {
    const filtrados = servicio
      ? historialLocal.filter((h) => h.servicio === servicio)
      : historialLocal
    return filtrados.slice(0, limite)
  }
}

/**
 * POST /monitor/verificar -> Fuerza un chequeo inmediato de salud.
 */
export async function verificarServiciosMonitor(servicio = null) {
  try {
    const { data } = await monitorClient.post('/monitor/verificar', null, {
      params: { servicio: servicio || undefined },
    })
    const servicios = Array.isArray(data) ? data.map(normalizeEstadoServicio) : []
    return { servicios, fuente: 'MONITOR_SERVICE' }
  } catch {
    const servicios = await sondearTodosDirecto(servicio)
    return { servicios, fuente: 'DIRECTO_FRONTEND' }
  }
}

/**
 * POST /monitor/despertar -> Envía pings con timeout extendido y reintentos
 * en paralelo para levantar servicios inactivos/hibernados.
 */
export async function despertarServiciosMonitor(servicio = null) {
  try {
    const { data } = await monitorClient.post('/monitor/despertar', null, {
      params: { servicio: servicio || undefined },
      timeout: 60000,
    })
    const servicios = Array.isArray(data) ? data.map(normalizeEstadoServicio) : []
    return { servicios, fuente: 'MONITOR_SERVICE' }
  } catch {
    // Respaldo directo: hasta 2 rondas con timeout extendido de 10s
    let servicios = await sondearTodosDirecto(servicio, 10000)
    const algunoCaido = servicios.some((s) => s.estado === 'DOWN')
    if (algunoCaido) {
      await new Promise((resolve) => setTimeout(resolve, 1800))
      servicios = await sondearTodosDirecto(servicio, 10000)
    }
    return { servicios, fuente: 'DIRECTO_FRONTEND' }
  }
}

export default monitorClient
