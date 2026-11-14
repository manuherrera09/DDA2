// Minúsculas y sin tildes, para comparar texto escrito por el usuario ("cordoba" = "Córdoba").
export function normalizeText(value) {
  return String(value).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}
