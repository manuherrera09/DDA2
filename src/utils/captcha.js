function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Desafío aritmético simple. Es una barrera local contra envíos automáticos básicos, no una verificación de servidor.
export function createChallenge() {
  const operation = ['+', '−', '×'][randomInt(0, 2)]
  let a = randomInt(2, 9)
  let b = randomInt(2, 9)
  if (operation === '−' && a < b) [a, b] = [b, a]
  const answer = operation === '+' ? a + b : operation === '−' ? a - b : a * b
  return { question: `${a} ${operation} ${b}`, answer }
}

export function isCorrectAnswer(challenge, value) {
  const text = value.trim()
  return /^\d+$/.test(text) && Number(text) === challenge.answer
}
