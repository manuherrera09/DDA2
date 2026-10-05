import { useMemo, useState } from 'react'
import { normalizeText } from '../utils/text'
import FormField from './FormField'
import VehicleFilters from './VehicleFilters'
import VehicleOption from './VehicleOption'

const noFilters = { brand: '', model: '', transmission: '', year: '', priceMin: null, priceMax: null, kmMin: null, kmMax: null }
const PRICE_STEP = 1000000
const KM_STEP = 10000

function matchesFilters(vehicle, filters, priceBounds, kmBounds) {
  return normalizeText(vehicle.brand).includes(normalizeText(filters.brand.trim()))
    && normalizeText(vehicle.model).includes(normalizeText(filters.model.trim()))
    && (!filters.transmission || vehicle.transmission === filters.transmission)
    && (!filters.year || vehicle.year === Number(filters.year))
    && vehicle.price >= (filters.priceMin ?? priceBounds.min)
    && vehicle.price <= (filters.priceMax ?? priceBounds.max)
    && vehicle.km >= (filters.kmMin ?? kmBounds.min)
    && vehicle.km <= (filters.kmMax ?? kmBounds.max)
}

function roundedBounds(values, step) {
  return {
    min: Math.floor(Math.min(...values) / step) * step,
    max: Math.ceil(Math.max(...values) / step) * step,
  }
}

function VehicleSelection({ vehicles, selectedId, downPayment, financing, onChange }) {
  const [filters, setFilters] = useState(noFilters)

  const priceBounds = useMemo(() => roundedBounds(vehicles.map((v) => v.price), PRICE_STEP), [vehicles])
  const kmBounds = useMemo(() => roundedBounds(vehicles.map((v) => v.km), KM_STEP), [vehicles])

  const hasFilters = Object.values(filters).some((value) => value !== '' && value !== null)
  // La unidad ya elegida siempre se muestra, aunque los filtros la excluyan.
  const visible = vehicles.filter((vehicle) => vehicle.id === selectedId || matchesFilters(vehicle, filters, priceBounds, kmBounds))

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  return (
    <>
      <VehicleFilters vehicles={vehicles} filters={filters} priceBounds={priceBounds} kmBounds={kmBounds} onChange={updateFilter} />
      <div className="vehicle-list-head">
        {hasFilters && <button type="button" onClick={() => setFilters(noFilters)}>Limpiar filtros</button>}
        <span aria-live="polite">{visible.length} {visible.length === 1 ? 'vehículo' : 'vehículos'}</span>
      </div>
      <div className="vehicle-list">
        {visible.map((vehicle) => (
          <VehicleOption key={vehicle.id} vehicle={vehicle} selected={selectedId === vehicle.id} onChange={onChange} />
        ))}
        {visible.length === 0 && <p className="vehicle-empty">No hay vehículos que coincidan con los filtros.</p>}
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
