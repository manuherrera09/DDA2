# DDA Motors · Frontend de precalificación de leads

Frontend del trabajo práctico de **Desarrollo de Aplicaciones II** (UADE). Es la parte web de un sistema que precalifica automáticamente a prospectos que quieren comprar un auto usado, construido sobre microservicios.

Este repositorio contiene **solo el frontend**. Los microservicios (`leads`, `clientes`, `vehiculos`, `calificacion`) y el API Gateway se desarrollan aparte, por eso hoy la app trabaja con datos de ejemplo (ver [Estado actual](#estado-actual)).

## Qué hace

- **Preformulario** (`/` o `/preformulario`): el prospecto completa sus datos, elige un vehículo del stock, indica anticipo, permuta y ubicación, y opcionalmente solicita financiación con su CUIL y consentimiento.
- **Cola del telemarketer** (`/cola` o `/cola-telemarketer`): lista de leads calificados con filtro por nivel (No potable, Potable, Muy potable), ficha, motivos, historial y acciones (tomar, derivar, descartar, corregir el nivel).

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

Copiar `.env.example` a `.env` si hace falta cambiar la URL del gateway:

```env
VITE_API_URL=http://localhost:8080/api
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
| Preformulario en dos pasos | Funcional. Al enviar no llama a ningún servicio: genera una referencia local. |
| Validaciones | Nombre y apellido (solo letras), email obligatorio con formato válido, teléfono opcional (10 a 13 dígitos). |
| Selección de vehículo | 12 vehículos hardcodeados en `src/data/vehicles.js`, con filtros en memoria por marca y modelo (autocompletado), caja, año, precio y kilómetros, y lista con scroll a partir de 6 unidades. `fotoUrl` es opcional: si falta, se muestra un bloque de color. |
| Captcha | Operación aritmética local, antes del envío final. No verifica nada en servidor. |
| Cola del telemarketer | Funcional sobre 3 leads de ejemplo; los cambios de estado y las correcciones viven solo en memoria. |
| Integración con los microservicios | Pendiente. `src/api/axiosClient.js` y `src/utils/constants.js` ya definen la base. |

## Documentación

- [`docs/contratos-backend.md`](docs/contratos-backend.md): qué espera el frontend de cada microservicio (endpoints, campos, errores) y los puntos abiertos a acordar con el equipo de backend.

## Convenciones del equipo

- Commits con formato [Conventional Commits](https://www.conventionalcommits.org/) y una descripción breve, por ejemplo `feat: agrego filtros de vehículos`.
- Los cambios entran por pull request.
