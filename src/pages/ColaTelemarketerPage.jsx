import { useMemo, useState } from 'react'
import { vehicles } from '../data/vehicles'

const initialLeads = [
  { id: 'DDA-482913', name: 'Martina López', phone: '11 5555 5555', vehicle: vehicles[0], level: 'Muy potable', score: 92, date: '02/10/2026 09:42', status: 'CALIFICADO', complete: true, reasons: ['Anticipo alto', 'Solicita financiación', 'Zona con cobertura'], history: [{ type: 'Automática', score: 92, level: 'Muy potable', date: '02/10/2026 09:43' }] },
  { id: 'DDA-481762', name: 'Nicolás Ferreyra', phone: '351 444 8822', vehicle: vehicles[1], level: 'Potable', score: 76, date: '02/10/2026 08:17', status: 'CALIFICADO', complete: true, reasons: ['Permuta declarada', 'Anticipo medio'], history: [{ type: 'Automática', score: 76, level: 'Potable', date: '02/10/2026 08:18' }] },
  { id: 'DDA-479304', name: 'Camila Suárez', phone: '342 612 9001', vehicle: vehicles[2], level: 'No potable', score: 38, date: '01/10/2026 16:06', status: 'CALIFICADO', complete: false, reasons: ['Sin anticipo declarado', 'Datos de contacto incompletos'], history: [{ type: 'Automática', score: 38, level: 'No potable', date: '01/10/2026 16:07' }] },
]

const levels = ['Todos', 'No potable', 'Potable', 'Muy potable']

function ColaTelemarketerPage() {
  const [leads, setLeads] = useState(initialLeads)
  const [filter, setFilter] = useState('Todos')
  const [selectedId, setSelectedId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const visibleLeads = useMemo(() => leads.filter((lead) => filter === 'Todos' || lead.level === filter), [filter, leads])
  const selectedLead = leads.find((lead) => lead.id === selectedId)

  function updateLead(updater, message) {
    setLeads((current) => current.map((lead) => lead.id === selectedId ? updater(lead) : lead))
    setFeedback(message)
  }

  function takeLead() { updateLead((lead) => ({ ...lead, status: 'EN GESTION' }), 'El lead pasó a EN GESTION.') }
  function discardLead() { updateLead((lead) => ({ ...lead, status: 'DESCARTADO' }), 'El lead fue descartado.') }
  function referLead() {
    if (!selectedLead.complete) { setFeedback('No se puede derivar: la ficha está incompleta.'); return }
    updateLead((lead) => ({ ...lead, status: 'DERIVADO' }), 'El lead fue derivado al vendedor.')
  }
  function correctLead() {
    const reason = window.prompt('Motivo obligatorio de la corrección')
    if (!reason?.trim()) { setFeedback('La corrección requiere un motivo.'); return }
    updateLead((lead) => ({ ...lead, level: lead.level === 'Muy potable' ? 'Potable' : 'Muy potable', history: [...lead.history, { type: 'Manual', score: lead.score, level: lead.level === 'Muy potable' ? 'Potable' : 'Muy potable', date: '02/10/2026 10:04', reason }] }), 'La calificación manual fue guardada.')
  }

  return <main className="queue-shell">
    <header className="queue-header"><div><div className="eyebrow">Operaciones comerciales</div><h1>Cola de leads</h1><p>Priorizá los contactos calificados y asigná el próximo paso.</p></div><a className="queue-link" href="/preformulario">Ver preformulario <span>↗</span></a></header>
    <div className="queue-toolbar"><div className="queue-count"><strong>{visibleLeads.length}</strong> leads en cola</div><div className="filter-group" role="group" aria-label="Filtrar por nivel">{levels.map((level) => <button key={level} className={filter === level ? 'filter-active' : ''} onClick={() => setFilter(level)}>{level}</button>)}</div></div>
    <div className="queue-layout"><section className="lead-table" aria-label="Leads calificados"><div className="lead-table-head"><span>Lead</span><span>Vehículo</span><span>Nivel / puntaje</span><span>Ingreso</span></div>{visibleLeads.map((lead) => <button className={`lead-row ${selectedId === lead.id ? 'lead-selected' : ''}`} key={lead.id} onClick={() => { setSelectedId(lead.id); setFeedback('') }}><span><strong>{lead.name}</strong><small>{lead.phone} · {lead.id}</small></span><span><b>{lead.vehicle.name}</b><small>{lead.vehicle.detail}</small></span><span><b className={`level level-${lead.level.replace(' ', '-').toLowerCase()}`}>{lead.level}</b><small>{lead.score} / 100</small></span><span><b>{lead.date.split(' ')[0]}</b><small>{lead.status}</small></span></button>)}</section>
      {selectedLead ? <aside className="lead-detail"><div className="detail-top"><div><span className="summary-label">Ficha del lead</span><h2>{selectedLead.name}</h2><p>{selectedLead.id} · {selectedLead.phone}</p></div><button className="close-detail" onClick={() => setSelectedId(null)} aria-label="Cerrar detalle">×</button></div><div className="score-panel"><span className={`level level-${selectedLead.level.replace(' ', '-').toLowerCase()}`}>{selectedLead.level}</span><strong>{selectedLead.score}<small>/100</small></strong><span className="status-pill">{selectedLead.status}</span></div><dl className="lead-facts"><div><dt>Vehículo de interés</dt><dd>{selectedLead.vehicle.name}<small>{selectedLead.vehicle.detail}</small></dd></div><div><dt>Motivos</dt><dd>{selectedLead.reasons.map((reason) => <span className="reason" key={reason}>{reason}</span>)}</dd></div></dl><div className="detail-actions"><button onClick={takeLead}>Tomar lead</button><button onClick={referLead}>Derivar al vendedor</button><button className="outline-action" onClick={correctLead}>Corregir nivel</button><button className="danger-action" onClick={discardLead}>Descartar</button></div>{feedback && <p className="action-feedback">{feedback}</p>}<div className="history"><h3>Historial de calificaciones</h3>{selectedLead.history.map((item, index) => <div className="history-row" key={`${item.date}-${index}`}><span>{item.type}</span><b>{item.level} · {item.score}</b><small>{item.date}{item.reason && ` · ${item.reason}`}</small></div>)}</div></aside> : <aside className="empty-detail"><span>←</span><strong>Seleccioná un lead</strong><p>Acá vas a ver la ficha, la calificación y las acciones disponibles.</p></aside>}</div>
  </main>
}

export default ColaTelemarketerPage
