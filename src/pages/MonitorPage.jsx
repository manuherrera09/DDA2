import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  despertarServiciosMonitor,
  obtenerEstadoMonitor,
  obtenerHistorialMonitor,
  verificarServiciosMonitor,
} from '../api/monitorClient'
import BrandHeader from '../components/BrandHeader'

const ESTADOS_FILTRO = ['Todos', 'UP', 'DEGRADADO', 'DOWN']

const ETIQUETAS_ESTADO = {
  UP: 'Operativo (UP)',
  DEGRADADO: 'Degradado',
  DOWN: 'Inactivo (DOWN)',
}

const DESCRIPCIONES_SERVICIO = {
  vehiculos: 'Catálogo de unidades en stock, precios y disponibilidad.',
  clientes: 'Datos personales, situación crediticia BCRA e historial de calificaciones.',
  leads: 'Recepción del preformulario, máquina de estados y cola comercial.',
  calificacion: 'Motor de reglas de scoring automático y correcciones manuales.',
}

function claseEstado(estado) {
  if (estado === 'UP') return 'health-up'
  if (estado === 'DEGRADADO') return 'health-degradado'
  return 'health-down'
}

function formatearHora(iso) {
  if (!iso) return '-'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '-'
  return fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatearFechaHora(iso) {
  if (!iso) return '-'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '-'
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function calcularPorcentajeBarraLatencia(latenciaMs, estado) {
  if (estado === 'DOWN') return 100
  if (!latenciaMs || latenciaMs <= 0) return 6
  return Math.min(100, Math.max(8, Math.round((latenciaMs / 1200) * 100)))
}

function MonitorPage() {
  const [servicios, setServicios] = useState([])
  const [fuente, setFuente] = useState('MONITOR_SERVICE')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [servicioSeleccionado, setServicioSeleccionado] = useState('vehiculos')
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [verificando, setVerificando] = useState(false)
  const [despertando, setDespertando] = useState(false)
  const [servicioEnAccion, setServicioEnAccion] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [mensajeAccion, setMensajeAccion] = useState('')

  const cargarHistorial = useCallback(async (nombreServicio) => {
    const items = await obtenerHistorialMonitor({
      servicio: nombreServicio,
      limite: 25,
    })
    setHistorial(Array.isArray(items) ? items : [])
  }, [])

  const cargarEstado = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!silencioso) setCargando(true)
      try {
        const respuesta = await obtenerEstadoMonitor({ forzar: false })
        const lista = respuesta.servicios || []
        setServicios(lista)
        setFuente(respuesta.fuente)
        if (lista.length > 0 && !lista.some((s) => s.servicio === servicioSeleccionado)) {
          setServicioSeleccionado(lista[0].servicio)
        }
      } finally {
        if (!silencioso) setCargando(false)
      }
    },
    [servicioSeleccionado],
  )

  useEffect(() => {
    cargarEstado()
  }, [cargarEstado])

  useEffect(() => {
    if (servicioSeleccionado) {
      cargarHistorial(servicioSeleccionado)
    }
  }, [servicioSeleccionado, servicios, cargarHistorial])

  useEffect(() => {
    if (!autoRefresh) return undefined
    const timer = setInterval(() => {
      cargarEstado({ silencioso: true })
    }, 15000)
    return () => clearInterval(timer)
  }, [autoRefresh, cargarEstado])

  const metricas = useMemo(() => {
    const total = servicios.length
    const up = servicios.filter((s) => s.estado === 'UP').length
    const degradados = servicios.filter((s) => s.estado === 'DEGRADADO').length
    const down = servicios.filter((s) => s.estado === 'DOWN').length

    const activos = servicios.filter((s) => s.estado !== 'DOWN' && s.latenciaMs > 0)
    const latenciaPromedio = activos.length
      ? Math.round(activos.reduce((acc, s) => acc + s.latenciaMs, 0) / activos.length)
      : 0

    let estadoGlobal = 'UP'
    if (total === 0 || down === total) {
      estadoGlobal = 'DOWN'
    } else if (down > 0 || degradados > 0) {
      estadoGlobal = 'DEGRADADO'
    }

    const ultimaFecha = servicios
      .map((s) => s.ultimaVerificacion)
      .filter(Boolean)
      .sort()
      .pop()

    return {
      total,
      up,
      degradados,
      down,
      latenciaPromedio,
      estadoGlobal,
      ultimaFecha,
    }
  }, [servicios])

  const serviciosVisibles = useMemo(
    () =>
      servicios.filter((item) =>
        filtroEstado === 'Todos' ? true : item.estado === filtroEstado,
      ),
    [servicios, filtroEstado],
  )

  const detalleActual = useMemo(
    () => servicios.find((s) => s.servicio === servicioSeleccionado) || servicios[0] || null,
    [servicios, servicioSeleccionado],
  )

  async function handleVerificarTodos() {
    setVerificando(true)
    setMensajeAccion('Ejecutando sondeo de salud en todos los microservicios…')
    try {
      const respuesta = await verificarServiciosMonitor()
      const lista = respuesta.servicios || []
      setServicios(lista)
      setFuente(respuesta.fuente)
      const activos = lista.filter((s) => s.estado === 'UP').length
      setMensajeAccion(
        `Verificación completada: ${activos} de ${lista.length} microservicios operativos (UP).`,
      )
    } finally {
      setVerificando(false)
    }
  }

  async function handleDespertarTodos() {
    setDespertando(true)
    setMensajeAccion(
      'Enviando ping de reactivación (wake-up) a todos los microservicios. Si alguno estaba hibernado, puede demorar unos segundos en levantar…',
    )
    try {
      const respuesta = await despertarServiciosMonitor()
      const lista = respuesta.servicios || []
      setServicios(lista)
      setFuente(respuesta.fuente)
      const activos = lista.filter((s) => s.estado === 'UP').length
      const caidos = lista.filter((s) => s.estado === 'DOWN').length
      if (caidos === 0) {
        setMensajeAccion(
          `¡Todos los microservicios (${activos}/${lista.length}) están activos y respondiendo!`,
        )
      } else {
        setMensajeAccion(
          `Señal de activación enviada: ${activos} operativos (UP) y ${caidos} aún sin respuesta (DOWN).`,
        )
      }
    } finally {
      setDespertando(false)
    }
  }

  async function handleDespertarServicioIndividual(nombreServicio, event) {
    if (event) event.stopPropagation()
    setServicioEnAccion(nombreServicio)
    setMensajeAccion(`Enviando ping / levantando el microservicio "${nombreServicio}"…`)
    try {
      const respuesta = await despertarServiciosMonitor(nombreServicio)
      const actualizados = respuesta.servicios || []
      if (actualizados.length > 0) {
        const nuevo = actualizados[0]
        setServicios((prev) =>
          prev.map((item) => (item.servicio === nuevo.servicio ? nuevo : item)),
        )
        setMensajeAccion(
          `Microservicio "${nuevo.nombreMostrar}": estado ${nuevo.estado} (${nuevo.latenciaMs} ms).`,
        )
      }
      await cargarHistorial(nombreServicio)
    } finally {
      setServicioEnAccion(null)
    }
  }

  return (
    <div className="app-shell">
      <BrandHeader />

      <main className="monitor-shell">
        <header className="queue-header monitor-header">
          <div>
            <div className="eyebrow">
              Sistema <span>/</span> Estado de servicios
            </div>
            <h1>
              Health <i>dashboard</i>
            </h1>
          </div>
          <nav className="monitor-nav" aria-label="Navegación rápida">
            <a className="queue-link" href="/preformulario">
              Preformulario <span>↗</span>
            </a>
            <a className="queue-link" href="/cola-telemarketer">
              Cola de leads <span>↗</span>
            </a>
          </nav>
        </header>

        <section className="monitor-kpis" aria-label="Resumen general del ecosistema">
          <article className="monitor-kpi-card">
            <span className="summary-label">Estado del ecosistema</span>
            <div className="monitor-kpi-value">
              <span className={`health-badge ${claseEstado(metricas.estadoGlobal)}`}>
                <i className="health-dot" />
                {ETIQUETAS_ESTADO[metricas.estadoGlobal] || metricas.estadoGlobal}
              </span>
            </div>
            <small>
              {metricas.down === 0
                ? 'Todos los servicios responden'
                : `${metricas.down} servicio(s) fuera de línea`}
            </small>
          </article>

          <article className="monitor-kpi-card">
            <span className="summary-label">Servicios online</span>
            <div className="monitor-kpi-value">
              <strong>
                {metricas.up} <small>/ {metricas.total || 4}</small>
              </strong>
            </div>
            <small>
              {metricas.degradados} degradado(s) · {metricas.down} caído(s)
            </small>
          </article>

          <article className="monitor-kpi-card">
            <span className="summary-label">Latencia promedio</span>
            <div className="monitor-kpi-value">
              <strong>
                {metricas.latenciaPromedio} <small>ms</small>
              </strong>
            </div>
            <small>Umbral degradado: 1000 ms</small>
          </article>

          <article className="monitor-kpi-card">
            <span className="summary-label">Último sondeo</span>
            <div className="monitor-kpi-value">
              <strong>{formatearHora(metricas.ultimaFecha)}</strong>
            </div>
            <small>
              Fuente:{' '}
              {fuente === 'MONITOR_SERVICE'
                ? 'Microservicio Monitor (:8085)'
                : 'Sondeo HTTP directo'}
            </small>
          </article>
        </section>

        <div className="queue-toolbar monitor-toolbar">
          <div className="filter-group" role="group" aria-label="Filtrar por estado de salud">
            {ESTADOS_FILTRO.map((estado) => (
              <button
                key={estado}
                type="button"
                className={filtroEstado === estado ? 'filter-active' : ''}
                onClick={() => setFiltroEstado(estado)}
              >
                {estado}
              </button>
            ))}
          </div>

          <div className="monitor-actions">
            <label className="monitor-autorefresh">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span>Auto-actualizar (15s)</span>
            </label>

            <button
              type="button"
              className="monitor-btn-secondary"
              onClick={handleVerificarTodos}
              disabled={verificando || despertando}
            >
              {verificando ? 'Verificando…' : '↻ Verificar estado'}
            </button>

            <button
              type="button"
              className="monitor-btn-wakeup"
              onClick={handleDespertarTodos}
              disabled={despertando || verificando}
            >
              {despertando
                ? 'Levantando servicios…'
                : '⚡ Ping / Levantar servicios'}
            </button>
          </div>
        </div>

        {mensajeAccion && (
          <div className="monitor-feedback" role="status">
            <span>●</span>
            <p>{mensajeAccion}</p>
            <button type="button" onClick={() => setMensajeAccion('')}>
              Cerrar
            </button>
          </div>
        )}

        <div className="queue-layout monitor-layout">
          <section className="monitor-grid" aria-label="Microservicios monitoreados">
            {cargando && servicios.length === 0 ? (
              <div className="vehicle-empty-state">
                <strong>Consultando estado de los microservicios…</strong>
                <p>Aguardá unos instantes mientras medimos la disponibilidad y latencia.</p>
              </div>
            ) : serviciosVisibles.length === 0 ? (
              <div className="vehicle-empty-state">
                <strong>No hay servicios en estado {filtroEstado}</strong>
                <p>Probá cambiando el filtro a &ldquo;Todos&rdquo; para ver el ecosistema completo.</p>
              </div>
            ) : (
              serviciosVisibles.map((srv) => {
                const seleccionado = detalleActual?.servicio === srv.servicio
                const procesandoEste = servicioEnAccion === srv.servicio || despertando
                const pctBarra = calcularPorcentajeBarraLatencia(srv.latenciaMs, srv.estado)

                return (
                  <article
                    key={srv.servicio}
                    className={`monitor-card ${seleccionado ? 'monitor-card-selected' : ''}`}
                    onClick={() => setServicioSeleccionado(srv.servicio)}
                  >
                    <div className="monitor-card-top">
                      <div>
                        <span className="monitor-service-id">{srv.servicio}</span>
                        <h3>{srv.nombreMostrar}</h3>
                      </div>
                      <span className={`health-badge ${claseEstado(srv.estado)}`}>
                        <i className="health-dot" />
                        {srv.estado}
                      </span>
                    </div>

                    <div className="monitor-latency-box">
                      <div className="monitor-latency-head">
                        <span>Tiempo de respuesta</span>
                        <strong>{srv.latenciaMs} ms</strong>
                      </div>
                      <div className="monitor-latency-track">
                        <div
                          className={`monitor-latency-fill ${claseEstado(srv.estado)}`}
                          style={{ width: `${pctBarra}%` }}
                        />
                      </div>
                    </div>

                    <dl className="monitor-meta">
                      <div>
                        <dt>Endpoint</dt>
                        <dd title={srv.urlConsultada}>{srv.urlConsultada || '-'}</dd>
                      </div>
                      <div>
                        <dt>HTTP / Hora</dt>
                        <dd>
                          {srv.codigoHttp ? `HTTP ${srv.codigoHttp}` : 'Sin respuesta'} ·{' '}
                          {formatearHora(srv.ultimaVerificacion)}
                        </dd>
                      </div>
                    </dl>

                    <div className="monitor-card-footer">
                      <small className="monitor-detail-text">{srv.detalle}</small>
                      <button
                        type="button"
                        className="monitor-card-ping-btn"
                        disabled={procesandoEste}
                        onClick={(e) => handleDespertarServicioIndividual(srv.servicio, e)}
                      >
                        {servicioEnAccion === srv.servicio
                          ? 'Enviando ping…'
                          : srv.estado === 'DOWN'
                            ? '⚡ Levantar servicio'
                            : '↻ Mandar ping'}
                      </button>
                    </div>
                  </article>
                )
              })
            )}
          </section>

          {detalleActual ? (
            <aside className="lead-detail monitor-detail">
              <div className="detail-top">
                <div>
                  <span className="summary-label">Detalle e historial del servicio</span>
                  <h2>{detalleActual.nombreMostrar}</h2>
                  <p>
                    Identificador: <strong>{detalleActual.servicio}</strong>
                  </p>
                </div>
              </div>

              <div className="score-panel">
                <span className={`health-badge ${claseEstado(detalleActual.estado)}`}>
                  <i className="health-dot" />
                  {ETIQUETAS_ESTADO[detalleActual.estado] || detalleActual.estado}
                </span>
                <strong>
                  {detalleActual.latenciaMs}
                  <small> ms</small>
                </strong>
                <span className="status-pill">
                  {detalleActual.codigoHttp ? `HTTP ${detalleActual.codigoHttp}` : 'OFFLINE'}
                </span>
              </div>

              <dl className="lead-facts">
                <div>
                  <dt>URL de verificación</dt>
                  <dd>
                    <code>{detalleActual.urlConsultada || '-'}</code>
                    <small> Estrategia: {detalleActual.tipoVerificacion || 'ACTUATOR_HEALTH'}</small>
                  </dd>
                </div>
                <div>
                  <dt>Diagnóstico actual</dt>
                  <dd>
                    {detalleActual.detalle || '-'}
                    <small>
                      Última comprobación: {formatearFechaHora(detalleActual.ultimaVerificacion)}
                    </small>
                  </dd>
                </div>
              </dl>

              <div className="detail-actions">
                <button
                  type="button"
                  disabled={servicioEnAccion === detalleActual.servicio || despertando}
                  onClick={(e) => handleDespertarServicioIndividual(detalleActual.servicio, e)}
                >
                  {servicioEnAccion === detalleActual.servicio
                    ? 'Enviando ping de reactivación…'
                    : `⚡ Enviar ping / Levantar ${detalleActual.servicio}`}
                </button>
              </div>

              <div className="history">
                <h3>Historial de verificaciones ({historial.length})</h3>
                {historial.length === 0 ? (
                  <p className="monitor-empty-history">
                    Todavía no hay registros históricos para este servicio.
                  </p>
                ) : (
                  <div className="monitor-history-list">
                    {historial.map((item, index) => (
                      <div
                        className="history-row monitor-history-row"
                        key={`${item.id || item.ultimaVerificacion}-${index}`}
                      >
                        <span>
                          <b className={`health-inline ${claseEstado(item.estado)}`}>
                            ● {item.estado}
                          </b>
                        </span>
                        <b>
                          {item.latenciaMs} ms{' '}
                          {item.codigoHttp ? `· HTTP ${item.codigoHttp}` : ''}
                        </b>
                        <small>
                          {formatearFechaHora(item.ultimaVerificacion)} · {item.detalle}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          ) : (
            <aside className="empty-detail">
              <span>←</span>
              <strong>Seleccioná un microservicio</strong>
              <p>Acá vas a ver el diagnóstico detallado y el historial de latencia y caídas.</p>
            </aside>
          )}
        </div>
      </main>
    </div>
  )
}

export default MonitorPage
