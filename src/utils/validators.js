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
  if (!text) return ''
  if (!/^\+?[\d\s()-]+$/.test(text)) return 'El teléfono solo puede contener números.'
  const digits = text.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 13) return 'Ingresá un teléfono válido con código de área (10 a 13 dígitos).'
  return ''
}

export function validateEmail(value) {
  const text = value.trim()
  if (!text) return 'El email es obligatorio.'
  if (!text.includes('@')) return 'El email debe incluir "@".'
  if (!EMAIL_REGEX.test(text)) return 'Ingresá un email válido, ej. nombre@gmail.com.'
  return ''
}

const CUIL_PREFIXES = ['20', '23', '24', '27']
const CUIL_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

function hasValidCheckDigit(digits) {
  const sum = CUIL_WEIGHTS.reduce((total, weight, index) => total + weight * Number(digits[index]), 0)
  const rest = sum % 11
  const expected = rest === 0 ? 0 : 11 - rest
  // Si da 10 no existe un dígito verificador válido para ese número.
  return expected !== 10 && expected === Number(digits[10])
}

export function validateCuil(value) {
  const text = value.trim()
  if (!text) return 'El CUIL es obligatorio para solicitar financiación.'
  if (!/^[\d\s-]+$/.test(text)) return 'El CUIL solo puede contener números.'
  const digits = text.replace(/\D/g, '')
  if (digits.length !== 11) return 'El CUIL debe tener 11 dígitos (formato XX-XXXXXXXX-X).'
  if (!CUIL_PREFIXES.includes(digits.slice(0, 2))) return 'El CUIL debe comenzar con 20, 23, 24 o 27.'
  if (!hasValidCheckDigit(digits)) return 'El CUIL no es válido, revisá los números.'
  return ''
}

export function validateConsent(checked) {
  return checked ? '' : 'Necesitamos tu consentimiento para consultar tu situación crediticia.'
}

// Paso 1: datos de contacto. Paso 2 (solo con financiación): CUIL y consentimiento.
const stepValidators = {
  1: {
    firstName: (value) => validateName(value, 'El nombre'),
    lastName: (value) => validateName(value, 'El apellido'),
    phone: validatePhone,
    email: validateEmail,
  },
  2: {
    cuil: validateCuil,
    consent: validateConsent,
  },
}

export const fieldValidators = { ...stepValidators[1], ...stepValidators[2] }

export function validateForm(form, step = 1) {
  const errors = {}
  for (const [field, validate] of Object.entries(stepValidators[step])) {
    const message = validate(form[field] ?? '')
    if (message) errors[field] = message
  }
  return errors
}
