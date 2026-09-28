function SummaryCard({ vehicle, downPayment, financing }) {
  return (
    <aside className="summary-column">
      <div className="summary-sticky">
        <div className="summary-label">Tu selección <span>En vivo</span></div>
        <div className="summary-visual">
          <div className="visual-glow" />
          <div className={`large-vehicle ${vehicle?.tone || 'ochre'}`}><strong>{vehicle?.mark || 'DDA'}</strong><span>★</span></div>
          <div className="visual-caption">{vehicle ? vehicle.name : 'Elegí tu próximo vehículo'}<small>{vehicle?.detail || 'Stock seleccionado para vos'}</small></div>
        </div>
        <div className="summary-details">
          <div><small>Unidad de interés</small><strong>{vehicle?.name || 'Aún no seleccionada'}</strong></div>
          <div><small>Anticipo</small><strong>{downPayment || 'A definir'}</strong></div>
          <div><small>Financiación</small><strong>{financing ? 'Solicitada' : 'No solicitada'}</strong></div>
        </div>
        <div className="advisor-note"><span>✦</span><p>Te asignamos un asesor<br /><strong>de tu zona.</strong></p></div>
        <div className="summary-footer"><span>dda</span> Tu información viaja segura</div>
      </div>
    </aside>
  )
}

export default SummaryCard
