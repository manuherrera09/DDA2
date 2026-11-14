import { useEffect, useId, useState } from 'react'
import { normalizeText } from '../utils/text'

// Combobox con sugerencias que se filtran en memoria mientras se escribe (sin pedidos al backend).
function AutocompleteInput({ label, name, value, options, placeholder, onChange }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const query = normalizeText(value.trim())
  const suggestions = options.filter((option) => normalizeText(option).includes(query))
  const exactOnly = suggestions.length === 1 && normalizeText(suggestions[0]) === query
  const isOpen = open && suggestions.length > 0 && !exactOnly

  useEffect(() => {
    if (active >= 0) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, id])

  function select(option) {
    onChange(name, option)
    setOpen(false)
    setActive(-1)
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((current) => Math.min(current + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      // En un filtro, Enter nunca debe enviar el formulario.
      event.preventDefault()
      if (isOpen && active >= 0) select(suggestions[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="field autocomplete">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={isOpen && active >= 0 ? `${id}-option-${active}` : undefined}
        onChange={(event) => { onChange(name, event.target.value); setOpen(true); setActive(-1) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <ul className="suggestions" id={`${id}-list`} role="listbox">
          {suggestions.map((option, index) => (
            <li
              key={option}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === active}
              className={index === active ? 'suggestion-active' : ''}
              onMouseDown={(event) => { event.preventDefault(); select(option) }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AutocompleteInput
