export function formatCurrency(value, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(value || 0)
}

export function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' }).format(new Date(value))
}

export function formatPhone(value) {
  return value ? String(value).replace(/\s+/g, ' ').trim() : '-'
}
