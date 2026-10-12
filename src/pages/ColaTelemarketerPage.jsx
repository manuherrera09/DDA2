import { useCallback, useEffect, useMemo, useState } from 'react'
import { LEAD_LEVELS } from '../utils/constants'
import {
  cambiarEstado,
  corregirCalificacion,
  obtenerCalificacion,
  obtenerCliente,
  obtenerCola,
  obtenerHistorial,
} from '../api/leadsClient'
import { getVehicleById } from '../api/vehiclesClient'

const NIVELES = {
  SIN_CALIFICACION: 'Sin calificación',
  NO_POTABLE: 'No potable',
  POTABLE: 'Potable',
  MUY_POTABLE: 'Muy potable',
}

const ESTADOS = {
  PENDIENTE: 'PENDIENTE',
  CALIFICADO: 'CALIFICADO',
  EN_GESTION: 'EN_GESTION',
  DERIVADO: 'DERIVADO',
  DESCARTADO: 'DESCARTADO',
}

const ESTADOS_LEGIBLES = {
  PENDIENTE: 'Pendiente',
  CALIFICADO: 'Calificado',
  EN_GESTION: 'En gestión',
  DERIVADO: 'Derivado',
  DESCARTADO: 'Descartado',
}

const levels = ['Todos', ...Object.values(LEAD_LEVELS)]
const states = ['Todos', ...Object.values(ESTADOS)]

function estadoLegible(estado) {
  return ESTADOS_LEGIBLES[estado] || formatState(estado) || 'Sin estado'
}

function nivelLegible(nivel) {
  return NIVELES[nivel] || nivel || 'Sin calificación'
}

function nivelKey(nivel) {
  return nivelLegible(nivel).replace(' ', '-').toLowerCase()
}

function toDateOnly(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('es-AR')
}

function formatPuntaje(puntaje) {
  if (puntaje == null) return '-'
  return String(puntaje)
}

function formatState(estado) {
  return estado ? estado.replace(/_/g, ' ') : ''
}

function ColaTelemarketerPage() {
  const [leads, setLeads] = useState([])
  const [vehicles, setVehicles] = useState({})
  const [clientes, setClientes] = useState({})
  const [filter, setFilter] = useState('Todos')
  const [estadoFilter, setEstadoFilter] = useState('Todos')
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  const loadCola = useCallback(async () => {
    setLoading(true)
    try {
      // GET /leads sin filtros devuelve toda la cola ya ordenada por el
      // servidor (potabilidad, puntaje y antigüedad). El front filtra en
      // memoria por nivel como antes.
      const data = await obtenerCola()
      setLeads(Array.isArray(data) ? data : [])
    } catch (err) {
      setFeedback(err?.response?.data?.detail || 'No se pudo cargar la cola de leads.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCola()
  }, [loadCola])

  // Los leads traen clienteId y vehiculoId; se resuelven por separado para
  // mostrar nombre, teléfono y vehículo sin duplicar datos en el lead.
  useEffect(() => {
    let cancelado = false
    const vehiculosUnicos = [...new Set(leads.map((l) => l.vehiculoId).filter(Boolean))]
    vehiculosUnicos.forEach((id) => {
      if (!vehicles[id]) {
        getVehicleById(id)
          .then((v) => {
            if (!cancelado) setVehicles((actual) => ({ ...actual, [id]: v }))
          })
          .catch(() => {})
      }
    })
    const clientesUnicos = [...new Set(leads.map((l) => l.clienteId).filter(Boolean))]
    clientesUnicos.forEach((id) => {
      if (!clientes[id]) {
        obtenerCliente(id)
          .then((c) => {
            if (!cancelado) setClientes((actual) => ({ ...actual, [id]: c }))
          })
          .catch(() => {})
      }
    })
    return () => {
      cancelado = true
    }
  }, [leads, vehicles, clientes])

  const visibleLeads = useMemo(
    () => leads.filter((lead) => {
      const porNivel = filter === 'Todos' || nivelLegible(lead.nivel) === filter
      const porEstado = estadoFilter === 'Todos' || lead.estado === estadoFilter
      return porNivel && porEstado
    }),
    [filter, estadoFilter, leads],
  )

  const selectedLead = leads.find((lead) => lead.id === selectedId)

  async function loadDetail(id) {
    setFeedback('')
    setDetail(null)
    if (!id) return
    const lead = leads.find((l) => l.id === id)
    if (!lead) return
    try {
      const cliente = clientes[lead.clienteId] || (lead.clienteId ? await obtenerCliente(lead.clienteId) : null)
      const [calificacion, historial] = await Promise.all([
        obtenerCalificacion(id).catch(() => null),
        cliente?.id ? obtenerHistorial(cliente.id).catch(() => null) : Promise.resolve(null),
      ])
      setDetail({
        calificacion,
        cliente,
        historial: historial?.calificaciones || null,
      })
    } catch (err) {
      setFeedback(err?.response?.data?.detail || 'No se pudo cargar la ficha del lead.')
    }
  }

  function selectLead(id) {
    setSelectedId(id)
    loadDetail(id)
  }

  async function cambiarEstadoSeleccionado(nuevoEstado, mensaje) {
    if (!selectedLead) return
    try {
      await cambiarEstado(selectedLead.id, nuevoEstado)
      setFeedback(mensaje)
      await loadCola()
    } catch (err) {
      setFeedback(err?.response?.data?.detail || 'No se pudo actualizar el estado del lead.')
    }
  }

  function takeLead() {
    cambiarEstadoSeleccionado(ESTADOS.EN_GESTION, 'El lead pasó a EN GESTION.')
  }
  function discardLead() {
    cambiarEstadoSeleccionado(ESTADOS.DESCARTADO, 'El lead fue descartado.')
  }
  function referLead() {
    if (selectedLead && !selectedLead.fichaCompleta) {
      setFeedback('No se puede derivar: la ficha está incompleta.')
      return
    }
    cambiarEstadoSeleccionado(ESTADOS.DERIVADO, 'El lead fue derivado al vendedor.')
  }

  async function correctLead() {
    if (!selectedLead) return
    const nivelActual = detail?.calificacion?.nivel || selectedLead.nivel
    const opciones = ['MUY_POTABLE', 'POTABLE', 'NO_POTABLE'].filter((n) => n !== nivelActual)
    const nivel = window.prompt(
      `Nuevo nivel (actual: ${nivelLegible(nivelActual)}).\nOpciones: ${opciones.map(nivelLegible).join(', ')}`,
      opciones[0] || 'POTABLE',
    )
    if (!nivel) return
    const motivo = window.prompt('Motivo obligatorio de la corrección')
    if (!motivo?.trim()) {
      setFeedback('La corrección requiere un motivo.')
      return
    }
    try {
      await corregirCalificacion(selectedLead.id, { nivel: nivel.trim(), motivo: motivo.trim() })
      setFeedback('La calificación manual fue guardada.')
      await loadDetail(selectedLead.id)
    } catch (err) {
      setFeedback(err?.response?.data?.detail || 'No se pudo guardar la corrección.')
    }
  }

  function clienteNombre(cliente) {
    if (!cliente) return '-'
    return [cliente.nombre, cliente.apellido].filter(Boolean).join(' ')
  }

  return <main className="queue-shell">
    <header className="queue-header"><div><div className="eyebrow">Operaciones comerciales</div><h1>Cola de leads</h1><p>Priorizá los contactos calificados y asigná el próximo paso.</p></div><a className="queue-link" href="/preformulario">Ver preformulario <span>↗</span></a></header>
    <div className="queue-toolbar"><div className="queue-count"><strong>{loading ? '…' : visibleLeads.length}</strong> leads en cola</div><div className="filter-group" role="group" aria-label="Filtrar por nivel">{levels.map((level) => <button key={level} className={filter === level ? 'filter-active' : ''} onClick={() => setFilter(level)}>{level}</button>)}</div><div className="filter-group" role="group" aria-label="Filtrar por estado">{states.map((estado) => <button key={estado} className={estadoFilter === estado ? 'filter-active' : ''} onClick={() => setEstadoFilter(estado)}>{estado === 'Todos' ? 'Todos' : estadoLegible(estado)}</button>)}</div></div>
    <div className="queue-layout"><section className="lead-table" aria-label="Leads calificados"><div className="lead-table-head"><span>Lead</span><span>Vehículo</span><span>Nivel / puntaje</span><span>Ingreso</span></div>{visibleLeads.map((lead) => { const vehiculo = vehicles[lead.vehiculoId]; const cliente = clientes[lead.clienteId]; return <button className={`lead-row ${selectedId === lead.id ? 'lead-selected' : ''}`} key={lead.id} onClick={() => selectLead(lead.id)}><span><strong>{clienteNombre(cliente)}</strong><small>{cliente?.telefono || '-'} · {lead.id}</small></span><span><b>{vehiculo?.name || '-'}</b><small>{vehiculo?.detail || ''}</small></span><span><b className={`level level-${nivelKey(lead.nivel)}`}>{nivelLegible(lead.nivel)}</b><small>{formatPuntaje(lead.puntaje)} / 100</small></span><span><b>{toDateOnly(lead.creadoEn)}</b><small>{formatState(lead.estado)}</small></span></button>})}</section>
      {selectedLead ? <aside className="lead-detail"><div className="detail-top"><div><span className="summary-label">Ficha del lead</span><h2>{clienteNombre(detail?.cliente)}</h2><p>{selectedLead.id} · {detail?.cliente?.telefono || '-'}</p></div><button className="close-detail" onClick={() => setSelectedId(null)} aria-label="Cerrar detalle">×</button></div><div className="score-panel"><span className={`level level-${nivelKey(detail?.calificacion?.nivel || selectedLead.nivel)}`}>{nivelLegible(detail?.calificacion?.nivel || selectedLead.nivel)}</span><strong>{formatPuntaje(detail?.calificacion?.puntos ?? selectedLead.puntaje)}<small>/100</small></strong><span className="status-pill">{formatState(selectedLead.estado)}</span></div><dl className="lead-facts"><div><dt>Vehículo de interés</dt><dd>{vehicles[selectedLead.vehiculoId]?.name || '-'}<small>{vehicles[selectedLead.vehiculoId]?.detail || ''}</small></dd></div><div><dt>Motivos</dt><dd>{(detail?.calificacion?.motivos || []).map((motivo) => <span className="reason" key={motivo.id}>{motivo.descripcion}</span>)}</dd></div></dl><div className="detail-actions"><button onClick={takeLead}>Tomar lead</button><button onClick={referLead}>Derivar al vendedor</button><button className="outline-action" onClick={correctLead}>Corregir nivel</button><button className="danger-action" onClick={discardLead}>Descartar</button></div>{feedback && <p className="action-feedback">{feedback}</p>}<div className="history"><h3>Historial de calificaciones</h3>{(detail?.historial || []).map((item, index) => <div className="history-row" key={`${item.calculadaEn}-${index}`}><span>{item.origen === 'MANUAL' ? 'Manual' : 'Automática'}</span><b>{nivelLegible(item.nivel)} · {item.puntaje}</b><small>{item.calculadaEn ? new Date(item.calculadaEn).toLocaleString('es-AR') : '-'}{item.observacion && ` · ${item.observacion}`}</small></div>)}</div></aside> : <aside className="empty-detail"><span>←</span><strong>Seleccioná un lead</strong><p>Acá vas a ver la ficha, la calificación y las acciones disponibles.</p></aside>}</div>
  </main>
}

export default ColaTelemarketerPage
