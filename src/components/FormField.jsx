import FieldError from './FieldError'

// `error` undefined = campo sin validación inline (no reserva espacio); '' = válido pero reserva el espacio.
function FormField({ label, optional, error, children }) {
  return (
    <label className={`field ${error ? 'field-invalid' : ''}`}>
      <span>{label} {optional && <small>Opcional</small>}</span>
      {children}
      {error !== undefined && <FieldError message={error} />}
    </label>
  )
}

export default FormField
