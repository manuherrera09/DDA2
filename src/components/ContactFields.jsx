import FormField from './FormField'

function ContactFields({ form, errors, onChange, onBlur }) {
  const props = (name) => ({ name, value: form[name], onChange, onBlur, 'aria-invalid': Boolean(errors[name]) })

  return (
    <>
      <div className="field-row">
        <FormField label="Nombre" error={errors.firstName ?? ''}>
          <input {...props('firstName')} placeholder="Ej. Martina" autoComplete="given-name" />
        </FormField>
        <FormField label="Apellido" error={errors.lastName ?? ''}>
          <input {...props('lastName')} placeholder="Ej. López" autoComplete="family-name" />
        </FormField>
      </div>
      <div className="field-row">
        <FormField label="Teléfono / WhatsApp" optional error={errors.phone ?? ''}>
          <input {...props('phone')} type="tel" inputMode="tel" placeholder="11 5555 5555" autoComplete="tel" />
        </FormField>
        <FormField label="Email" error={errors.email ?? ''}>
          <input {...props('email')} type="text" inputMode="email" placeholder="nombre@gmail.com" autoComplete="email" />
        </FormField>
      </div>
    </>
  )
}

export default ContactFields
