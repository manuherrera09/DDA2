function FormField({ label, optional, children }) {
  return (
    <label className="field">
      <span>{label} {optional && <small>Opcional</small>}</span>
      {children}
    </label>
  )
}

export default FormField
