const THUMB = 16

// Slider de dos puntas hecho con dos <input type="range"> superpuestos.
function RangeSlider({ label, bounds, min, max, step, format, onChange }) {
  const span = bounds.max - bounds.min || 1
  const start = (min - bounds.min) / span
  const end = (max - bounds.min) / span
  const inner = `(100% - ${THUMB}px)`

  return (
    <div className="price-slider">
      <div className="price-slider-head">
        <span>{label}</span>
        <b>{format(min)} – {format(max)}</b>
      </div>
      <div className="price-slider-track">
        <div className="price-slider-fill" style={{ left: `calc(${THUMB / 2}px + ${inner} * ${start})`, right: `calc(${THUMB / 2}px + ${inner} * ${1 - end})` }} />
        <input
          type="range"
          className="range-input"
          aria-label={`${label} mínimo`}
          min={bounds.min}
          max={bounds.max}
          step={step}
          value={min}
          // Con ambas puntas juntas, la que está arriba es la que se puede seguir moviendo hacia el lado libre.
          style={{ zIndex: min > (bounds.min + bounds.max) / 2 ? 5 : 3 }}
          onChange={(event) => onChange(Math.min(Number(event.target.value), max - step), max)}
        />
        <input
          type="range"
          className="range-input"
          aria-label={`${label} máximo`}
          min={bounds.min}
          max={bounds.max}
          step={step}
          value={max}
          style={{ zIndex: 4 }}
          onChange={(event) => onChange(min, Math.max(Number(event.target.value), min + step))}
        />
      </div>
    </div>
  )
}

export default RangeSlider
