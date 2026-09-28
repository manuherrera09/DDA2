import { useState } from 'react'
import BrandHeader from '../components/BrandHeader'
import ContactFields from '../components/ContactFields'
import FinancingDetails from '../components/FinancingDetails'
import LocationFields from '../components/LocationFields'
import ProgressBar from '../components/ProgressBar'
import SectionHeading from '../components/SectionHeading'
import SuccessMessage from '../components/SuccessMessage'
import SummaryCard from '../components/SummaryCard'
import TradeInOptions from '../components/TradeInOptions'
import VehicleSelection from '../components/VehicleSelection'
import { vehicles } from '../data/vehicles'

const initialForm = {
  name: '',
  phone: '',
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
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === form.vehicle)

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setSubmitted(false)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  function resetForm() {
    setForm(initialForm)
    setSubmitted(false)
  }

  return (
    <main className="app-shell">
      <BrandHeader />
      <div className="page-grid">
        <section className="form-column">
          <div className="eyebrow">Precalificación comercial <span>•</span> 01 de 02</div>
          <h1>Encontremos tu<br /><i>próximo vehículo.</i></h1>
          <p className="intro">Completá tus datos y preferencias. Un asesor de DDA Motors te va a contactar para continuar.</p>
          <ProgressBar financing={form.financing} />

          <form onSubmit={handleSubmit}>
            <SectionHeading number="01" title="Datos de contacto" description="¿Cómo podemos encontrarte?" />
            <ContactFields form={form} onChange={updateField} />

            <div className="section-gap"><SectionHeading number="02" title="Tu próximo vehículo" description="Elegí una opción de nuestro stock disponible." /></div>
            <VehicleSelection vehicles={vehicles} selectedId={form.vehicle} downPayment={form.downPayment} financing={form.financing} onChange={updateField} />

            <div className="section-gap"><SectionHeading number="03" title="Tu vehículo en parte de pago" description="Contanos si tenés una unidad para entregar." /></div>
            <TradeInOptions value={form.tradeIn} onChange={updateField} />
            {form.tradeIn === 'yes' && <div className="field-row reveal"><label className="field"><span>Descripción de la unidad</span><input required name="tradeDescription" value={form.tradeDescription} onChange={updateField} placeholder="Marca, modelo y año" /></label><label className="field"><span>Valor estimado</span><input required name="tradeValue" value={form.tradeValue} onChange={updateField} placeholder="$ 0" /></label></div>}

            <div className="section-gap"><SectionHeading number="04" title="¿Dónde estás?" description="Así asignamos el asesor más cercano." /></div>
            <LocationFields form={form} onChange={updateField} />
            <FinancingDetails form={form} onChange={updateField} />

            <div className="submit-row"><button type="submit">Enviar preformulario <span>→</span></button><p>Sin compromiso <span>·</span> Tus datos están protegidos</p></div>
          </form>

          {submitted && <SuccessMessage name={form.name} financing={form.financing} hasCuil={Boolean(form.cuil)} onReset={resetForm} />}
        </section>
        <SummaryCard vehicle={selectedVehicle} downPayment={form.downPayment} financing={form.financing} />
      </div>
    </main>
  )
}

export default PrequalificationView
