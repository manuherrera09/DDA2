import FieldError from './FieldError'

function Captcha({ challenge, value, error, onChange, onRefresh }) {
  return (
    <div className={`captcha ${error ? 'field-invalid' : ''}`}>
      <div className="captcha-box">
        <span className="captcha-label">Verificación</span>
        <div className="captcha-row">
          <label htmlFor="captcha-answer" className="captcha-question">¿Cuánto es <b>{challenge.question}</b>?</label>
          <input id="captcha-answer" name="captcha" value={value} onChange={onChange} inputMode="numeric" autoComplete="off" placeholder="Resultado" aria-invalid={Boolean(error)} />
          <button type="button" className="captcha-refresh" onClick={onRefresh} aria-label="Generar otra operación" title="Otra operación">↻</button>
        </div>
      </div>
      <FieldError message={error} />
    </div>
  )
}

export default Captcha
