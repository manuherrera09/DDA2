export function formatCurrency(value, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value || 0)
}

export function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' }).format(new Date(value))
}

export function formatPhone(value) {
  return value ? String(value).replace(/\s+/g, ' ').trim() : '-'
}

export function formatKm(value) {
  return `${new Intl.NumberFormat('es-AR').format(value || 0)} km`
}

// Da formato XX-XXXXXXXX-X mientras se escribe, sin aceptar más de 11 dígitos.
export function formatCuil(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
}
