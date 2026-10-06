import FormField from './FormField'

function LocationFields({ form, onChange }) {
  return (
    <div className="field-row">
      <FormField label="Provincia">
        <select required name="province" value={form.province} onChange={onChange}>
          <option value="">Seleccioná una provincia</option>
          <option>Buenos Aires</option>
          <option>CABA</option>
          <option>Córdoba</option>
          <option>Santa Fe</option>
          <option>Mendoza</option>
        </select>
      </FormField>
      <FormField label="Localidad">
        <input required name="city" value={form.city} onChange={onChange} placeholder="Ej. San Isidro" />
      </FormField>
    </div>
  )
}

export default LocationFields
