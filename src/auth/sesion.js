// Almacén de la sesión del operador (access token + refresh token).
//
// Se guarda en sessionStorage: sobrevive a recargar la pestaña pero se pierde al
// cerrarla, que es lo razonable para un panel interno. Si el navegador lo bloquea
// (modo privado estricto, políticas) se cae a memoria y la app sigue andando.

const CLAVE = 'dda2.sesion'
const EVENTO_SESION_CERRADA = 'dda2:sesion-cerrada'

let enMemoria = null

function leerAlmacen() {
  try {
    const crudo = window.sessionStorage.getItem(CLAVE)
    return crudo ? JSON.parse(crudo) : null
  } catch {
    return enMemoria
  }
}

function escribirAlmacen(valor) {
  enMemoria = valor
  try {
    if (valor) window.sessionStorage.setItem(CLAVE, JSON.stringify(valor))
    else window.sessionStorage.removeItem(CLAVE)
  } catch {
    // Sin sessionStorage: queda solo en memoria.
  }
}

export function obtenerTokens() {
  const sesion = leerAlmacen()
  if (!sesion?.accessToken || !sesion?.refreshToken) return null
  return sesion
}

export function guardarTokens({ access_token: accessToken, refresh_token: refreshToken }) {
  escribirAlmacen({ accessToken, refreshToken })
}

export function limpiarTokens() {
  escribirAlmacen(null)
}

// El access token es un JWT: el front solo lee los datos para mostrarlos (email,
// rol). Nunca decide permisos con esto; el que valida la firma es el orquestador.
export function leerUsuario(accessToken) {
  try {
    const carga = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(carga)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
    const { sub, email, rol } = JSON.parse(json)
    return { id: sub, email, rol }
  } catch {
    return null
  }
}

// Aviso para que la interfaz vuelva al login cuando la sesión deja de ser válida
// por una causa externa (refresh vencido, token revocado, etc.).
export function avisarSesionCerrada() {
  window.dispatchEvent(new Event(EVENTO_SESION_CERRADA))
}

export function alCerrarseLaSesion(callback) {
  window.addEventListener(EVENTO_SESION_CERRADA, callback)
  return () => window.removeEventListener(EVENTO_SESION_CERRADA, callback)
}
