# DDA Motors · Frontend de precalificación de leads

Frontend del trabajo práctico de **Desarrollo de Aplicaciones II** (UADE). Es la parte web de un sistema que precalifica automáticamente a prospectos que quieren comprar un auto usado, construido sobre microservicios.

Este repositorio contiene **solo el frontend**. Los microservicios (`leads`, `clientes`, `vehiculos`, `calificacion`) y el API Gateway se desarrollan aparte, por eso hoy la app trabaja con datos de ejemplo (ver [Estado actual](#estado-actual)).

## Qué hace

- **Preformulario** (`/` o `/preformulario`): el prospecto completa sus datos, elige un vehículo del stock, indica anticipo, permuta y ubicación, y opcionalmente solicita financiación con su CUIL y consentimiento.
- **Cola del telemarketer** (`/cola` o `/cola-telemarketer`): lista de leads calificados con filtro por nivel (No potable, Potable, Muy potable), ficha, motivos, historial y acciones (tomar, derivar, descartar, corregir el nivel).
  Requiere iniciar sesión (ver [Login del operador](#login-del-operador)).
- **Health Dashboard** (`/monitor` o `/health`): panel de monitoreo de salud de los microservicios (`vehiculos`, `clientes`, `leads`, `calificacion`) con semáforo de estado (`UP`, `DEGRADADO`, `DOWN`), latencia en milisegundos, historial de verificaciones y botón de ping/reactivación (*wake-up*).

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0` (lo exige Vite 8)
- [pnpm](https://pnpm.io/)

## Cómo correrlo

```bash
pnpm install
pnpm dev        # servidor de desarrollo (por defecto http://localhost:5173)
pnpm build      # build de producción en dist/
pnpm preview    # sirve el build localmente
```

En este proyecto se usa **pnpm** para todos los comandos de Node.

### Variables de entorno

Copiar `.env.example` a `.env` si hace falta cambiar las URLs de los microservicios:

```env
VITE_API_URL=http://localhost:8080/api
VITE_VEHICULOS_API_URL=http://localhost:8083
VITE_LEADS_API_URL=http://localhost:8000
VITE_CALIFICACION_API_URL=http://localhost:8084
VITE_CLIENTES_API_URL=http://localhost:8082
VITE_MONITOR_API_URL=http://localhost:8085
```

## Stack

React 19 · Vite 8 · React Router 7 · Axios. Estilos en CSS plano (`src/styles.css`), sin librerías de UI.

## Estructura

```
src/
├── api/          cliente Axios y notas para integrar con el backend
├── components/   componentes del formulario, filtros, captcha, etc.
├── data/         datos de ejemplo (vehículos)
├── pages/        páginas por ruta (preformulario, cola, 404)
├── utils/        validaciones, formateo, captcha, constantes
├── views/        vista principal del preformulario
└── styles.css    estilos globales
public/           favicon (el mismo logo que usa el header)
docs/             documentación para el equipo
```

## Estado actual

| Parte | Estado |
|---|---|
| Preformulario en dos pasos | Funcional. El segundo paso aparece solo si se solicita financiación y pide CUIL y consentimiento. Al enviar no llama a ningún servicio: genera una referencia local. |
| Validaciones | Nombre y apellido (solo letras), email obligatorio con formato válido, teléfono opcional (10 a 13 dígitos). Si se solicita financiación, el CUIL es obligatorio y se valida (11 dígitos, prefijo 20/23/24/27 y dígito verificador) y el consentimiento también. |
| Selección de vehículo | 12 vehículos hardcodeados en `src/data/vehicles.js`, con filtros en memoria por marca y modelo (autocompletado), caja, año, precio y kilómetros, y lista con scroll a partir de 6 unidades. `fotoUrl` es opcional: si falta, se muestra un bloque de color. |
| Captcha | Operación aritmética local, antes del envío final. No verifica nada en servidor. |
| Cola del telemarketer | Funcional, detrás de login de operador, y consume leads, clientes, vehículos y calificación a través del orquestador. |
| Health Dashboard (`/monitor`) | Funcional. Consume `GET /monitor/estado`, `GET /monitor/historial`, `POST /monitor/verificar` y `POST /monitor/despertar` del microservicio Monitor (`VITE_MONITOR_API_URL`), con respaldo de sondeo HTTP directo si el servicio monitor no está activo. |
| Integración con los microservicios | Todo pasa por el orquestador (`axiosClient.js`, `VITE_API_URL`) mediante `leadsClient.js`, `vehiclesClient.js` y `authClient.js`. Solo `monitorClient.js` (Health Dashboard) llama directo al servicio monitor. |

## Documentación

- [`docs/contratos-backend.md`](docs/contratos-backend.md): qué espera el frontend de cada microservicio (endpoints, campos, errores) y los puntos abiertos a acordar con el equipo de backend.

## Convenciones del equipo

- Commits con formato [Conventional Commits](https://www.conventionalcommits.org/) y una descripción breve, por ejemplo `feat: agrego filtros de vehículos`.
- Los cambios entran por pull request.

## Login del operador

La cola del telemarketer (`/cola`) pide iniciar sesión con un usuario de `AuthMicroservice`. El preformulario y el catálogo de vehículos **no** piden login.

- `src/auth/sesion.js`: guarda `access_token` y `refresh_token` en `sessionStorage` (se pierden al cerrar la pestaña; sin `sessionStorage` quedan en memoria).
- `src/api/axiosClient.js`: agrega `Authorization: Bearer` a cada pedido. Si el orquestador responde `401` con `codigo: TOKEN_EXPIRADO`, renueva con `POST /auth/refresh` (una sola vez aunque fallen varios pedidos a la vez) y repite el pedido. Si el refresh falla o el token fue revocado, vuelve al login.
- `src/pages/LoginPage.jsx`: formulario de login. Ante un `429` del límite de intentos muestra una cuenta regresiva con el `Retry-After` del servidor (5 minutos).
- **Cerrar sesión** llama a `POST /auth/logout`: el orquestador invalida el token en el acto.

Para probar en local hace falta el orquestador (`:8080`) con `JWT_SECRET` y el servicio de auth (`:8086`) corriendo; ver la guía de desarrollo local del orquestador.
