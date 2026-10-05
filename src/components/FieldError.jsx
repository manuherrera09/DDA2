// Ocupa siempre su espacio (aunque no haya mensaje) para que mostrar un error no mueva el layout.
function FieldError({ message }) {
  return <em className="field-error" role={message ? 'alert' : undefined} aria-live="polite">{message}</em>
}

export default FieldError
