import { formatCurrency, formatKm } from '../utils/formatters'
import VehicleThumb from './VehicleThumb'

function VehicleOption({ vehicle, selected, onChange }) {
  return (
    <label className={`vehicle-option ${selected ? 'is-selected' : ''}`}>
      <input type="radio" name="vehicle" value={vehicle.id} checked={selected} onChange={onChange} required />
      <VehicleThumb vehicle={vehicle} />
      <span className="vehicle-copy"><strong>{vehicle.name}</strong><small>{vehicle.detail} · {vehicle.transmission} · {formatKm(vehicle.km)}</small></span>
      <span className="vehicle-price">{formatCurrency(vehicle.price)}<small>Precio de lista</small></span>
      <span className="radio-dot" />
    </label>
  )
}

export default VehicleOption
