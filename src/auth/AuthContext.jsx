import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { cerrarSesion, iniciarSesion } from '../api/authClient'
import { alCerrarseLaSesion, leerUsuario, obtenerTokens } from './sesion'

const AuthContext = createContext(null)

function usuarioGuardado() {
  const sesion = obtenerTokens()
  return sesion ? leerUsuario(sesion.accessToken) : null
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(usuarioGuardado)
  const [sesionExpirada, setSesionExpirada] = useState(false)

  // Si el orquestador deja de aceptar la sesión (refresh vencido, token revocado),
  // se vuelve al login con un aviso.
  useEffect(
    () =>
      alCerrarseLaSesion(() => {
        setUsuario(null)
        setSesionExpirada(true)
      }),
    [],
  )

  const login = useCallback(async (email, password) => {
    const tokens = await iniciarSesion(email, password)
    setSesionExpirada(false)
    setUsuario(leerUsuario(tokens.access_token))
  }, [])

  const logout = useCallback(async () => {
    await cerrarSesion()
    setSesionExpirada(false)
    setUsuario(null)
  }, [])

  const valor = useMemo(
    () => ({ usuario, sesionExpirada, login, logout }),
    [usuario, sesionExpirada, login, logout],
  )
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
