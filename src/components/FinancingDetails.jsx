import FormField from './FormField'

function FinancingDetails({ form, onChange }) {
  if (!form.financing) return null

  return (
    <div className="finance-box reveal">
      <div className="finance-icon">↗</div>
      <div>
        <h3>Un paso más para simular tu plan</h3>
        <p>Para evaluar opciones de financiación necesitamos tu CUIL y tu consentimiento informado. Si preferís no completarlo, igual vamos a calificar tu consulta sin consultar tu situación crediticia.</p>
        <div className="field-row">
          <FormField label="CUIL" optional>
            <input name="cuil" value={form.cuil} onChange={onChange} placeholder="20-12345678-9" pattern="[0-9]{2}-?[0-9]{8}-?[0-9]" />
          </FormField>
          <label className="consent">
            <input type="checkbox" name="consent" checked={form.consent} onChange={onChange} />
            <span>Autorizo el uso de mis datos para analizar alternativas de financiación y ser contactado por DDA Motors.</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default FinancingDetails
