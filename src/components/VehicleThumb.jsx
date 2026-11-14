import { useState } from 'react'

// Muestra la foto si hay `fotoUrl` y carga bien; si falta o falla, queda el bloque de color con iniciales.
function VehicleThumb({ vehicle }) {
  const [failed, setFailed] = useState(false)
  const hasPhoto = Boolean(vehicle.fotoUrl) && !failed

  return (
    <span className={`vehicle-thumb ${vehicle.tone} ${hasPhoto ? 'has-photo' : ''}`}>
      {hasPhoto
        ? <img src={vehicle.fotoUrl} alt={vehicle.name} loading="lazy" onError={() => setFailed(true)} />
        : <><b>{vehicle.mark}</b><small>{vehicle.year}</small></>}
    </span>
  )
}

export default VehicleThumb
