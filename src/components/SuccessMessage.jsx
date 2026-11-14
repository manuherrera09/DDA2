function SuccessMessage({ name, leadId, onReset }) {
  return (
    <div className="success-message">
      <span>✓</span>
      <div>
        <strong>Tu solicitud fue recibida, {name || 'gracias'}</strong>
        <p>Referencia: <b>{leadId}</b>. La calificación sigue en proceso. Un asesor te contactará pronto.</p>
      </div>
      <button type="button" onClick={onReset}>Nueva consulta</button>
    </div>
  )
}

export default SuccessMessage
