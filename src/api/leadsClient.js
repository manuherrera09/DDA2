import axios from 'axios'

// No hay API Gateway en este despliegue: cada microservicio se expone en su propio
// puerto. Este cliente apunta directo a leads y delega calificaciones/clientes en
// sus propios clientes.
const VITE_LEADS_API_URL = import.meta.env.VITE_LEADS_API_URL || 'http://localhost:8000'
const VITE_CALIFICACION_API_URL = import.meta.env.VITE_CALIFICACION_API_URL || 'http://localhost:8084'
const VITE_CLIENTES_API_URL = import.meta.env.VITE_CLIENTES_API_URL || 'http://localhost:8082'

const leadsClient = axios.create({
  baseURL: VITE_LEADS_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const calificacionesClient = axios.create({
  baseURL: VITE_CALIFICACION_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const clientesClient = axios.create({
  baseURL: VITE_CLIENTES_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const PROVINCIAS = {
  'Buenos Aires': 'BUENOS_AIRES',
  CABA: 'CABA',
  'Córdoba': 'CORDOBA',
  'Santa Fe': 'SANTA_FE',
  Mendoza: 'MENDOZA',
}

export function normalizarProvincia(provincia) {
  return PROVINCIAS[provincia] || provincia.trim().toUpperCase().replace(/\s+/g, '_')
}

// Convierte montos escritos por el usuario ("3.000.000", "$ 3.000.000") a número.
function aNumero(valor) {
  if (valor == null || valor === '') return 0
  const soloNumeros = String(valor).replace(/[^\d]/g, '')
  return soloNumeros ? Number(soloNumeros) : 0
}

export function buildPreformulario(form) {
  const solicitaFinanciacion = Boolean(form.financing)
  const tienePermuta = form.tradeIn === 'yes'

  const body = {
    cliente: {
      nombre: form.firstName.trim(),
      apellido: form.lastName.trim(),
      email: form.email.trim(),
    },
    vehiculoId: form.vehicle,
    anticipo: aNumero(form.downPayment),
    permuta: {
      tienePermuta,
      descripcion: tienePermuta ? form.tradeDescription.trim() : null,
      valorDeclarado: tienePermuta ? aNumero(form.tradeValue) : null,
    },
    ubicacion: {
      provincia: normalizarProvincia(form.province),
      localidad: form.city.trim(),
    },
    solicitaFinanciacion,
  }

  if (form.phone?.trim()) body.cliente.telefono = form.phone.trim()
  if (solicitaFinanciacion) {
    body.cliente.cuil = form.cuil.replace(/\D/g, '')
    body.cliente.consentimiento = Boolean(form.consent)
  }

  return body
}

// POST /leads -> 202 Accepted con { lead_id }.
export function crearLead(preformulario) {
  return leadsClient.post('/leads', preformulario).then(({ data }) => data)
}

// El DTO de leads (LeadDetalleDTO) serializa en snake_case. Se normaliza a
// camelCase para que el resto del front consuma un único formato.
export function normalizeLead(lead) {
  if (!lead) return lead
  return {
    ...lead,
    clienteId: lead.clienteId ?? lead.cliente_id,
    vehiculoId: lead.vehiculoId ?? lead.vehiculo_id,
    solicitaFinanciacion: lead.solicitaFinanciacion ?? lead.solicita_financiacion,
    fichaCompleta: lead.fichaCompleta ?? lead.ficha_completa,
    permutaTiene: lead.permutaTiene ?? lead.permuta_tiene,
    permutaDescripcion: lead.permutaDescripcion ?? lead.permuta_descripcion,
    permutaValorDeclarado: lead.permutaValorDeclarado ?? lead.permuta_valor_declarado,
    permutaComputable: lead.permutaComputable ?? lead.permuta_computable,
    creadoEn: lead.creadoEn ?? lead.creado_en,
  }
}

// GET /leads?estado=CALIFICADO&nivel=... -> cola del telemarketer.
export function obtenerCola({ estado, nivel } = {}) {
  return leadsClient
    .get('/leads', { params: { estado, nivel } })
    .then(({ data }) => (Array.isArray(data) ? data.map(normalizeLead) : data))
}

// GET /leads/{id} -> ficha del lead.
export function obtenerLead(id) {
  return leadsClient
    .get(`/leads/${encodeURIComponent(id)}`)
    .then(({ data }) => normalizeLead(data))
}

// GET /clientes/{id} -> datos del cliente (nombre, apellido, teléfono).
export function obtenerCliente(id) {
  return clientesClient.get(`/clientes/${encodeURIComponent(id)}`).then(({ data }) => data)
}

// PATCH /leads/{id}/state?nuevo_estado=... -> transición de estado.
export function cambiarEstado(id, nuevoEstado) {
  return leadsClient
    .patch(`/leads/${encodeURIComponent(id)}/state`, null, { params: { nuevo_estado: nuevoEstado } })
    .then(({ data }) => data)
}

// GET /calificaciones/{leadId} -> calificación vigente con motivos.
export function obtenerCalificacion(leadId) {
  return calificacionesClient.get(`/calificaciones/${encodeURIComponent(leadId)}`).then(({ data }) => data)
}

// POST /calificaciones/{leadId}/correcciones -> corrección manual.
export function corregirCalificacion(leadId, { nivel, motivo }) {
  return calificacionesClient
    .post(`/calificaciones/${encodeURIComponent(leadId)}/correcciones`, { nuevoNivel: nivel, motivo })
    .then(({ data }) => data)
}

// GET /clientes/{clienteId}/historial -> historial de calificaciones.
export function obtenerHistorial(clienteId) {
  return clientesClient.get(`/clientes/${encodeURIComponent(clienteId)}/historial`).then(({ data }) => data)
}
