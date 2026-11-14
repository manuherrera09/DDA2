import { normalizeText } from '../utils/text'
import AutocompleteInput from './AutocompleteInput'
import { formatCurrency, formatKm } from '../utils/formatters'
import RangeSlider from './RangeSlider'

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => (typeof a === 'number' ? b - a : a.localeCompare(b, 'es')))
}

function VehicleFilters({ vehicles, filters, priceBounds, kmBounds, onChange }) {
  const brandQuery = normalizeText(filters.brand.trim())
  const brands = uniqueSorted(vehicles.map((v) => v.brand))
  const models = uniqueSorted(vehicles.filter((v) => normalizeText(v.brand).includes(brandQuery)).map((v) => v.model))
  const years = uniqueSorted(vehicles.map((v) => v.year))

  // Una punta en su tope equivale a "sin filtro", así "Limpiar" y el estado inicial coinciden.
  function changeRange(prefix, bounds, min, max) {
    onChange(prefix + "Min", min === bounds.min ? null : min)
    onChange(prefix + "Max", max === bounds.max ? null : max)
  }

  const handleSelect = (event) => onChange(event.target.name, event.target.value)

  return (
    <div className="vehicle-filters" role="group" aria-label="Filtrar vehículos">
      <AutocompleteInput label="Marca" name="brand" value={filters.brand} options={brands} placeholder="Ej. Toyota" onChange={onChange} />
      <AutocompleteInput label="Modelo" name="model" value={filters.model} options={models} placeholder="Ej. Corolla" onChange={onChange} />
      <label className="field">
        <span>Caja</span>
        <select name="transmission" value={filters.transmission} onChange={handleSelect}>
          <option value="">Todas</option>
          <option>Automática</option>
          <option>Manual</option>
        </select>
      </label>
      <label className="field">
        <span>Año</span>
        <select name="year" value={filters.year} onChange={handleSelect}>
          <option value="">Todos</option>
          {years.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </label>
      <RangeSlider
        label="Precio"
        bounds={priceBounds}
        min={filters.priceMin ?? priceBounds.min}
        max={filters.priceMax ?? priceBounds.max}
        step={500000}
        format={formatCurrency}
        onChange={(min, max) => changeRange('price', priceBounds, min, max)}
      />
      <RangeSlider
        label="Kilómetros"
        bounds={kmBounds}
        min={filters.kmMin ?? kmBounds.min}
        max={filters.kmMax ?? kmBounds.max}
        step={5000}
        format={formatKm}
        onChange={(min, max) => changeRange('km', kmBounds, min, max)}
      />
    </div>
  )
}

export default VehicleFilters
