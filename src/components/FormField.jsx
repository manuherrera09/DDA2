function FormField({ label, optional, error, children }) {
  return (
    <label className={`field ${error ? 'field-invalid' : ''}`}>
      <span>{label} {optional && <small>Opcional</small>}</span>
      {children}
      {error && <em className="field-error" role="alert">{error}</em>}
    </label>
  )
}

export default FormField
