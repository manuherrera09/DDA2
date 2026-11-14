import { formatCurrency, formatKm } from '../utils/formatters'
import VehicleThumb from './VehicleThumb'

function VehicleOption({ vehicle, selected, onChange }) {
  // Un radio no dispara change al volver a tocarlo: se simula para poder deseleccionar la tarjeta.
  function handleClick() {
    if (selected) onChange({ target: { name: 'vehicle', value: '', type: 'radio', checked: false } })
  }

  return (
    <label className={`vehicle-option ${selected ? 'is-selected' : ''}`}>
      <input type="radio" name="vehicle" value={vehicle.id} checked={selected} onChange={onChange} onClick={handleClick} />
      <VehicleThumb vehicle={vehicle} />
      <span className="vehicle-copy"><strong>{vehicle.name}</strong><small>{vehicle.detail} · {vehicle.transmission} · {formatKm(vehicle.km)}</small></span>
      <span className="vehicle-price">{formatCurrency(vehicle.price)}<small>Precio de lista</small></span>
      <span className="radio-dot" />
    </label>
  )
}

export default VehicleOption
