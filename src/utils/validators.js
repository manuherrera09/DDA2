const NAME_REGEX = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateName(value, label = 'El nombre') {
  const text = value.trim()
  if (!text) return `${label} es obligatorio.`
  if (text.length < 2) return `${label} es demasiado corto.`
  if (!NAME_REGEX.test(text)) return `${label} solo puede contener letras.`
  return ''
}

export function validatePhone(value) {
  const text = value.trim()
  if (!text) return 'El teléfono es obligatorio.'
  if (!/^\+?[\d\s()-]+$/.test(text)) return 'El teléfono solo puede contener números.'
  const digits = text.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 13) return 'Ingresá un teléfono válido con código de área (10 a 13 dígitos).'
  return ''
}

export function validateEmail(value) {
  const text = value.trim()
  if (!text) return ''
  if (!text.includes('@')) return 'El email debe incluir "@".'
  if (!EMAIL_REGEX.test(text)) return 'Ingresá un email válido, ej. nombre@gmail.com.'
  return ''
}

export const fieldValidators = {
  firstName: (value) => validateName(value, 'El nombre'),
  lastName: (value) => validateName(value, 'El apellido'),
  phone: validatePhone,
  email: validateEmail,
}

export function validateForm(form) {
  const errors = {}
  for (const [field, validate] of Object.entries(fieldValidators)) {
    const message = validate(form[field] ?? '')
    if (message) errors[field] = message
  }
  return errors
}
