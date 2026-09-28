function SuccessMessage({ name, financing, hasCuil, onReset }) {
  return (
    <div className="success-message">
      <span>✓</span>
      <div>
        <strong>¡Listo, {name || 'gracias'}!</strong>
        <p>Tu consulta fue registrada. {financing && !hasCuil ? 'Te vamos a contactar sin evaluación crediticia.' : 'Un asesor te contactará pronto.'}</p>
      </div>
      <button type="button" onClick={onReset}>Nueva consulta</button>
    </div>
  )
}

export default SuccessMessage
