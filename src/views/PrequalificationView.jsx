import { useState } from 'react'
import BrandHeader from '../components/BrandHeader'
import Captcha from '../components/Captcha'
import ContactFields from '../components/ContactFields'
import FinancingDetails from '../components/FinancingDetails'
import LocationFields from '../components/LocationFields'
import ProgressBar from '../components/ProgressBar'
import SectionHeading from '../components/SectionHeading'
import SuccessMessage from '../components/SuccessMessage'
import TradeInOptions from '../components/TradeInOptions'
import VehicleSelection from '../components/VehicleSelection'
import { vehicles } from '../data/vehicles'
import { createChallenge, isCorrectAnswer } from '../utils/captcha'
import { formatCuil } from '../utils/formatters'
import { fieldValidators, validateForm } from '../utils/validators'

const initialForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  vehicle: '',
  downPayment: '',
  tradeIn: 'no',
  tradeDescription: '',
  tradeValue: '',
  province: '',
  city: '',
  financing: false,
  cuil: '',
  consent: false,
}

function PrequalificationView() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(1)
  const [leadId, setLeadId] = useState('')
  const [errors, setErrors] = useState({})
  const [challenge, setChallenge] = useState(createChallenge)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaError, setCaptchaError] = useState('')
  const isFinalStep = !(step === 1 && form.financing)

  function refreshCaptcha() {
    setChallenge(createChallenge())
    setCaptchaAnswer('')
    setCaptchaError('')
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target
    const next = type === 'checkbox' ? checked : name === 'cuil' ? formatCuil(value) : value
    setForm((current) => ({ ...current, [name]: next }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: fieldValidators[name](next) }))
    setSubmitted(false)
  }

  function validateField(event) {
    const { name, value } = event.target
    if (fieldValidators[name]) setErrors((current) => ({ ...current, [name]: fieldValidators[name](value) }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const found = validateForm(form, step)
    setErrors(found)
    if (Object.keys(found).length) {
      document.querySelector('.field-invalid input')?.focus()
      return
    }
    if (form.financing && step === 1) {
      setStep(2)
      return
    }

    if (!isCorrectAnswer(challenge, captchaAnswer)) {
      setCaptchaError(captchaAnswer.trim() ? 'La respuesta no es correcta, probá con otra operación.' : 'Resolvé la operación para enviar el formulario.')
      if (captchaAnswer.trim()) {
        // Respuesta incorrecta: nueva operación, pero se conserva el mensaje de error.
        setChallenge(createChallenge())
        setCaptchaAnswer('')
      }
      document.getElementById('captcha-answer')?.focus()
      return
    }

    refreshCaptcha()
    setLeadId(`DDA-${Date.now().toString().slice(-6)}`)
    setSubmitted(true)
  }

  // Sin financiación no se pide CUIL: se descarta lo cargado y sus errores.
  function skipFinancing() {
    setStep(1)
    setForm((current) => ({ ...current, financing: false, cuil: '', consent: false }))
    setErrors((current) => ({ ...current, cuil: undefined, consent: undefined }))
  }

  function resetForm() {
    setForm(initialForm)
    setSubmitted(false)
    setStep(1)
    setLeadId('')
    setErrors({})
    refreshCaptcha()
  }

  return (
    <main className="app-shell">
      <BrandHeader />
      <div className="page-grid">
        <section className="form-column">
          <div className="eyebrow">Precalificación comercial</div>
          <h1>Encontremos tu<br /><i>próximo vehículo.</i></h1>
          <p className="intro">Completá tus datos y preferencias. Un asesor de DDA Motors te va a contactar para continuar.</p>
          <ProgressBar financing={form.financing} step={step} />

          <form onSubmit={handleSubmit}>
            {step === 1 && <>
              <SectionHeading title="Datos de contacto" description="¿Cómo podemos encontrarte?" />
              <ContactFields form={form} errors={errors} onChange={updateField} onBlur={validateField} />

              <div className="section-gap"><SectionHeading number="02" title="Tu próximo vehículo" description="Elegí una opción de nuestro stock disponible." /></div>
              <VehicleSelection vehicles={vehicles} selectedId={form.vehicle} downPayment={form.downPayment} financing={form.financing} onChange={updateField} />

              <div className="section-gap"><SectionHeading number="03" title="Tu vehículo en parte de pago" description="Contanos si tenés una unidad para entregar." /></div>
              <TradeInOptions value={form.tradeIn} onChange={updateField} />
              {form.tradeIn === 'yes' && <div className="field-row reveal"><label className="field"><span>Descripción de la unidad</span><input required name="tradeDescription" value={form.tradeDescription} onChange={updateField} placeholder="Marca, modelo, año y kilometraje" /></label><label className="field"><span>Valor estimado</span><input required name="tradeValue" value={form.tradeValue} onChange={updateField} placeholder="$ 0" /></label></div>}

              <div className="section-gap"><SectionHeading number="04" title="¿Dónde estás?" description="Así asignamos el asesor más cercano." /></div>
              <LocationFields form={form} onChange={updateField} />
            </>}

            {step === 2 && <div className="step-two reveal">
              <SectionHeading number="02" title="Financiación" description="Completá estos datos para evaluar alternativas." />
              <FinancingDetails form={form} errors={errors} onChange={updateField} onBlur={validateField} />
              <p className="step-note">El CUIL y el consentimiento son necesarios para evaluar la financiación. Si preferís no compartirlos, podés continuar sin solicitarla.</p>
            </div>}

            {isFinalStep && <Captcha challenge={challenge} value={captchaAnswer} error={captchaError} onChange={(event) => { setCaptchaAnswer(event.target.value); setCaptchaError('') }} onRefresh={refreshCaptcha} />}

            <div className="submit-row">
              {step === 2 && <button type="button" className="secondary-button" onClick={skipFinancing}>Seguir sin financiación</button>}
              <button type="submit">{step === 1 && form.financing ? 'Continuar' : 'Enviar preformulario'} <span>→</span></button>
              <p>Sin compromiso <span>·</span> Tus datos están protegidos</p>
            </div>
          </form>

          {submitted && <SuccessMessage name={form.firstName} leadId={leadId} onReset={resetForm} />}
        </section>
      </div>
    </main>
  )
}

export default PrequalificationView
