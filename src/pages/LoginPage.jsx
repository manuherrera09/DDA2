import { useEffect, useState } from 'react'
import { segundosDeEspera } from '../api/authClient'
import { useAuth } from '../auth/AuthContext'

function formatearEspera(segundos) {
  const m = Math.floor(segundos / 60)
  const s = String(segundos % 60).padStart(2, '0')
  return `${m}:${s}`
}

function mensajeDeError(error) {
  const estado = error?.response?.status
  if (estado === 401) return error.response.data?.detail || 'Email o contraseña incorrectos.'
  if (estado === 422) return 'Revisá que el email tenga un formato válido.'
  if (!error?.response) return 'No se pudo conectar con el servidor. Probá de nuevo en un momento.'
  return error.response.data?.detail || 'No se pudo iniciar sesión.'
}

function LoginPage() {
  const { login, sesionExpirada } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [espera, setEspera] = useState(0)

  // Cuenta regresiva cuando el servidor bloquea el login por demasiados intentos.
  useEffect(() => {
    if (espera <= 0) return undefined
    const timer = setTimeout(() => setEspera((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [espera])

  async function enviar(event) {
    event.preventDefault()
    if (enviando || espera > 0) return
    setEnviando(true)
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setPassword('')
      if (err?.response?.status === 429) {
        setEspera(segundosDeEspera(err) ?? 300)
        setError('')
      } else {
        setError(mensajeDeError(err))
      }
    } finally {
      setEnviando(false)
    }
  }

  const bloqueado = espera > 0

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="login-title">
        <div className="eyebrow">Acceso del equipo</div>
        <h1 id="login-title" className="login-title">Iniciar sesión</h1>
        <p className="login-intro">Ingresá con tu usuario de operador para ver la cola de leads.</p>

        {sesionExpirada && !bloqueado && (
          <p className="login-aviso" role="status">Tu sesión se cerró. Volvé a ingresar para continuar.</p>
        )}

        <form onSubmit={enviar} noValidate>
          <label className="modal-field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={enviando}
              required
              autoFocus
            />
          </label>
          <label className="modal-field">
            <span>Contraseña</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={enviando}
              required
            />
          </label>

          {error && <p className="login-error" role="alert">{error}</p>}
          {bloqueado && (
            <p className="login-error" role="alert">
              Demasiados intentos fallidos. Podés volver a probar en <strong>{formatearEspera(espera)}</strong>.
            </p>
          )}

          <button className="login-submit" type="submit" disabled={enviando || bloqueado || !email || !password}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
            <span>↗</span>
          </button>
        </form>

        <a className="queue-link login-volver" href="/preformulario">Ir al preformulario <span>↗</span></a>
      </section>
    </main>
  )
}

export default LoginPage
