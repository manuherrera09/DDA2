import FieldError from './FieldError'
import FormField from './FormField'

function FinancingDetails({ form, errors, onChange, onBlur }) {
  if (!form.financing) return null

  return (
    <div className="finance-box reveal">
      <div className="finance-icon">↗</div>
      <div>
        <h3>Un paso más para simular tu plan</h3>
        <p>Para evaluar opciones de financiación necesitamos tu CUIL y tu consentimiento informado. Si preferís no compartirlos, podés seguir sin solicitar financiación.</p>
        <div className="field-row">
          <FormField label="CUIL" error={errors.cuil ?? ''}>
            <input name="cuil" value={form.cuil} onChange={onChange} onBlur={onBlur} inputMode="numeric" autoComplete="off" placeholder="Ej. 20-12345678-6" aria-invalid={Boolean(errors.cuil)} />
          </FormField>
          <div className={`consent-field ${errors.consent ? 'field-invalid' : ''}`}>
            <label className="consent">
              <input type="checkbox" name="consent" checked={form.consent} onChange={onChange} aria-invalid={Boolean(errors.consent)} />
              <span>Autorizo el uso de mi CUIL para consultar mi situación crediticia, con la finalidad de evaluar alternativas de financiación, y ser contactado por DDA Motors.</span>
            </label>
            <FieldError message={errors.consent ?? ''} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancingDetails
