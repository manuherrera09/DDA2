import FormField from './FormField'

function ContactFields({ form, onChange }) {
  return (
    <div className="field-row">
      <FormField label="Nombre y apellido">
        <input required name="name" value={form.name} onChange={onChange} placeholder="Ej. Martina López" />
      </FormField>
      <FormField label="Teléfono / WhatsApp">
        <input required name="phone" value={form.phone} onChange={onChange} placeholder="11 5555 5555" />
      </FormField>
    </div>
  )
}

export default ContactFields
