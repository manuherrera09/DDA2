import FormField from './FormField'
import VehicleOption from './VehicleOption'

function VehicleSelection({ vehicles, selectedId, downPayment, financing, onChange }) {
  return (
    <>
      <div className="vehicle-list">
        {vehicles.map((vehicle) => (
          <VehicleOption key={vehicle.id} vehicle={vehicle} selected={selectedId === vehicle.id} onChange={onChange} />
        ))}
      </div>
      <div className="field-row finance-row">
        <FormField label="Anticipo en efectivo" optional>
          <input name="downPayment" value={downPayment} onChange={onChange} inputMode="numeric" placeholder="$ 0" />
        </FormField>
        <div className="toggle-field">
          <span>¿Solicitás financiación?</span>
          <label className="switch"><input type="checkbox" name="financing" checked={financing} onChange={onChange} /><span /></label>
          <small>{financing ? 'Sí, quiero financiar' : 'No por ahora'}</small>
        </div>
      </div>
    </>
  )
}

export default VehicleSelection
