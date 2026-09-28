function VehicleOption({ vehicle, selected, onChange }) {
  return (
    <label className={`vehicle-option ${selected ? 'is-selected' : ''}`}>
      <input type="radio" name="vehicle" value={vehicle.id} checked={selected} onChange={onChange} required />
      <span className={`vehicle-thumb ${vehicle.tone}`}><b>{vehicle.mark}</b><small>2024</small></span>
      <span className="vehicle-copy"><strong>{vehicle.name}</strong><small>{vehicle.detail}</small></span>
      <span className="vehicle-price">{vehicle.price}<small>Precio de lista</small></span>
      <span className="radio-dot" />
    </label>
  )
}

export default VehicleOption
