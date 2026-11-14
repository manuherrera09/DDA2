import axios from 'axios'

const vehiclesClient = axios.create({
  baseURL: import.meta.env.VITE_VEHICULOS_API_URL || 'https://vehiculosmicroservice.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

function formatTransmission(caja) {
  if (caja === 'AUTOMATICA') return 'Automática'
  if (caja === 'MANUAL') return 'Manual'
  return caja || ''
}

function getVehicleMark(marca, modelo) {
  return `${marca?.[0] || ''}${modelo?.[0] || ''}`.toUpperCase()
}

export function normalizeVehicle(vehicle) {
  return {
    ...vehicle,
    brand: vehicle.marca,
    model: vehicle.modelo,
    name: `${vehicle.marca || ''} ${vehicle.modelo || ''}`.trim(),
    detail: [vehicle.version, vehicle.anio].filter(Boolean).join(' · '),
    year: vehicle.anio,
    transmission: formatTransmission(vehicle.caja),
    km: vehicle.kilometraje,
    price: vehicle.precio,
    mark: getVehicleMark(vehicle.marca, vehicle.modelo),
    tone: 'blue',
  }
}

export function getVehicles() {
  return vehiclesClient.get('/vehiculos').then(({ data }) => data.map(normalizeVehicle))
}

export function getVehicleById(id) {
  return vehiclesClient.get(`/vehiculos/${encodeURIComponent(id)}`).then(({ data }) => normalizeVehicle(data))
}

export function getVehiclePrice(id) {
  return vehiclesClient.get(`/vehiculos/${encodeURIComponent(id)}/precio`).then(({ data }) => data)
}

export function getVehiclePriceHistory(id) {
  return vehiclesClient.get(`/vehiculos/${encodeURIComponent(id)}/historial-precios`).then(({ data }) => data)
}

export default vehiclesClient
