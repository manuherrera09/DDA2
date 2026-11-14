// Cartel para cuando la lista de vehículos no se puede mostrar (falló el pedido o no hay stock).
function VehicleEmptyState({ title, message, onRetry }) {
  return (
    <div className="vehicle-empty-state" role="alert">
      <svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 38l5-14a6 6 0 0 1 5.6-4h26.8a6 6 0 0 1 5.6 4l5 14" />
        <path d="M6 38h52a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
        <circle cx="16" cy="50" r="5" fill="#f4f0e8" />
        <circle cx="48" cy="50" r="5" fill="#f4f0e8" />
        <path d="M26 30l12 12M38 30L26 42" stroke="#b3402a" />
      </svg>
      <strong>{title}</strong>
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry}>Reintentar</button>}
    </div>
  )
}

export default VehicleEmptyState
