# Qué espera el frontend de cada microservicio

Resumen basado en el *Documento de arquitectura v1.0* (secciones 5, 6, 8, 9 y 10). Todo lo que el documento no define explícitamente está marcado como **[A confirmar]** y debe acordarse con el responsable del servicio antes de integrar.

El frontend **solo habla con el API Gateway** (`VITE_API_URL`, por defecto `http://localhost:8080/api`). Nunca llama directo a los servicios ni a Kafka.

| Servicio | Responsable | Lo usa el front para |
|---|---|---|
| vehiculos | Naim | Selector de vehículos del preformulario y sus filtros |
| clientes | Juan | Indirecto: recibe el CUIL y el consentimiento a través de `leads` |
| leads | Iván | Enviar el preformulario y trabajar la cola del telemarketer |
| calificacion | Manual | Motivos, historial y corrección manual del nivel |

## Convenciones generales

- **Errores:** formato `ProblemDetail` (RFC 7807): `type`, `title`, `status`, `detail`. El front debe mostrar `detail` y, en errores de validación, mapearlos al campo. **[A confirmar]** cómo vienen los errores por campo (ej. extensión `errors: { campo: mensaje }`).
- **IDs:** UUID en todos los servicios.
- **Trazabilidad:** el gateway genera el `correlationId`; el front no lo envía.
- **Sin autenticación** en la Primera Parte.
- **CORS:** lo resuelve el gateway.
- **Prefijo de rutas:** el documento dice que cada servicio se expone bajo `/api/{servicio}`, y las tablas listan rutas internas (`/leads`, `/vehiculos`...). **[A confirmar]** si la URL final es `/api/leads/leads` o `/api/leads`. Hoy `src/utils/constants.js` asume `/leads`, `/clientes`, `/vehiculos`, `/calificaciones` sobre `baseURL=/api`, lo que se corresponde con la segunda opción.

---

## vehiculos (Naim)

Alimenta el selector del paso 1 (RF05, RF11).

| Método | Ruta | Uso en el front |
|---|---|---|
| GET | `/vehiculos?disponible=true` | Lista del preformulario |
| GET | `/vehiculos/{id}` | Detalle de una unidad |
| GET | `/vehiculos/{id}/precio` | Lo usa `calificacion`; el front no lo necesita |
| POST / PUT | `/vehiculos` | Alta/edición (carga inicial por script, sin pantalla en el MVP) |

Campos del vehículo que el front consume (los del modelo de dominio del documento más dos que hay que acordar):

| Campo | Tipo | Estado |
|---|---|---|
| `id` | UUID | Del documento |
| `marca`, `modelo` | texto | Del documento |
| `anio` | entero | Del documento |
| `kilometraje` | entero (km) | Del documento; el front lo muestra y lo filtra |
| `precio` | numérico | Del documento |
| `disponible` | booleano | Del documento |
| `caja` | `Automática` o `Manual` | **[A confirmar]** no está en el documento; el front filtra por este campo |
| `fotoUrl` | URL, **opcional** | **[A confirmar]** no está en el documento; si falta o no carga, el front muestra un bloque de color con iniciales |

Las fotos no deberían guardarse en la base: `vehiculos` guarda solo la URL y sirve los archivos como estáticos. El front las muestra en una miniatura de proporción fija (recorte sin deformar), así que no necesitan venir con medidas exactas.

**Diferencias con el mock actual (`src/data/vehicles.js`)** a resolver al integrar:

- El mock usa nombres en inglés (`brand`, `model`, `year`, `km`, `transmission`, `price`, `fotoUrl`), más `detail` (versión), `tone` y `mark` (solo visuales). El front deberá adaptar los nombres del backend y derivar nombre, iniciales y formato de precio. `detail` (versión, ej. "Exclusive CVT") tampoco está en el modelo del documento **[A confirmar]**.
- **Filtros:** no se define filtrado en el servidor, solo `disponible`. El front trae la lista completa una vez y filtra en memoria, sin pedidos por tecla ni por cambio de filtro: marca y modelo (autocompletado), caja, año, y rangos de precio y kilometraje (sliders cuyos límites salen de los propios datos). Es suficiente para un stock chico; si el stock crece mucho habría que paginar o filtrar en el servidor.
- La lista del formulario muestra 6 vehículos a la vez con scroll.

## clientes (Juan)

El front **no lo llama directamente**: `leads` da de alta el cliente por REST al recibir el preformulario. Es el único servicio que conoce el CUIL.

- El CUIL y el consentimiento viajan en el `POST /leads` del front (**[A confirmar]**, el documento dice que `leads` "coordina el alta del cliente" pero no define el body).
- Si el servicio expone `GET /clientes/{id}`, el CUIL siempre vuelve **enmascarado**; el front nunca debe mostrarlo completo ni guardarlo en el estado más tiempo del necesario.
- Situación crediticia: número 1 a 6 o "sin datos". La consume `calificacion`, no el front.

## leads (Iván)

Es el servicio principal del front (RF01–RF03, RF07, RF08).

| Método | Ruta | Respuesta | Uso |
|---|---|---|---|
| POST | `/leads` | `202 Accepted` con `{ leadId }` | Enviar el preformulario |
| GET | `/leads?estado=&nivel=` | Lista ordenada por nivel, puntaje y antigüedad | Cola del telemarketer |
| GET | `/leads/{id}` | Ficha del lead | Panel de detalle |
| PATCH | `/leads/{id}/estado` | Lead actualizado | Tomar, derivar o descartar |

**Preformulario (`POST /leads`).** Campos que el documento exige (RF01/RF02). Nombres de propiedades **[A confirmar]**, estos son los sugeridos:

```json
{
  "nombre": "Martina",
  "apellido": "López",
  "telefono": "11 5555 5555",
  "email": "opcional@mail.com",
  "vehiculoId": "uuid",
  "anticipo": 3000000,
  "tienePermuta": true,
  "descripcionPermuta": "Fiat Cronos 2019",
  "valorPermutaDeclarado": 3000000,
  "provincia": "BUENOS_AIRES",
  "localidad": "San Isidro",
  "solicitaFinanciacion": true,
  "cuil": "20-12345678-9",
  "consentimiento": true
}
```

- `anticipo` y `valorPermutaDeclarado` son **números**, no strings con `$`. El front debe parsear lo que escribe el usuario.
- `provincia` es un enum en el contrato de eventos (`"BUENOS_AIRES"`). El select actual guarda texto libre (`"Buenos Aires"`, `"CABA"`); hace falta un mapeo o que Iván acepte ambos. **[A confirmar]** lista de valores válidos.
- `cuil` y `consentimiento` solo si `solicitaFinanciacion = true`. Si el usuario omite el paso 2, se envía sin ellos y el lead se califica igual sin situación crediticia.
- La respuesta es **inmediata (202)**: el front debe mostrar la confirmación con el `leadId` sin esperar la calificación.
- **Nombre y apellido:** el documento solo habla de "nombre", pero el formulario los pide por separado (ambos obligatorios). Se sugiere enviarlos separados; si `leads` guarda un único `nombreContacto`, lo arma concatenando. **[A confirmar]**.
- **Email:** el formulario lo pide como campo opcional y no figura en RF01. Si está, se valida que tenga "@" y dominio. `clientes` guarda un email en su modelo, pero hay que acordar si `leads` lo recibe y lo reenvía. **[A confirmar]**.
- **Validaciones del front** (el backend debe repetirlas, porque el cliente no es confiable): nombre y apellido solo letras (mín. 2); teléfono de 10 a 13 dígitos, admite `+`, espacios, guiones y paréntesis; email opcional con formato válido. Los errores 4xx con `ProblemDetail` deberían poder asociarse a estos campos.
- **Captcha:** hoy es una operación aritmética local, sin ninguna verificación en servidor ni campo en el `POST`. Si se quiere uno real (reCAPTCHA, Turnstile), el front enviaría un token y el gateway o `leads` tendrían que validarlo contra el proveedor con una clave secreta guardada en variables de entorno. **[A confirmar]** si se hace.

**Cola del telemarketer.**

- Estados del lead: `PENDIENTE_CALIFICACION`, `CALIFICADO`, `EN_GESTION`, `DERIVADO`, `DESCARTADO`. El mock actual usa `'EN GESTION'` con espacio; con el backend serán con guión bajo.
- Niveles: `No potable`, `Potable`, `Muy potable` (**[A confirmar]** si vienen como enum `NO_POTABLE`, `POTABLE`, `MUY_POTABLE`; `constants.js` ya define la variante legible).
- La cola viene **ya ordenada** por el servidor. El front solo envía el filtro `nivel` y, si corresponde, `estado`.
- Cada item debería incluir: `id`, `nombreContacto`, `telefono`, `vehiculoId` (o datos del vehículo), `nivel`, `puntaje`, `estado`, `creadoEn`, y si la ficha está completa. **[A confirmar]** si el vehículo viene embebido o hay que resolverlo contra `vehiculos`.
- Un lead recién enviado puede aparecer sin nivel/puntaje (`PENDIENTE_CALIFICACION`) hasta que `calificacion` responda. No hay push: se necesita refrescar (botón o polling) para verlo calificado.

**Cambios de estado (`PATCH /leads/{id}/estado`).**

- Body **[A confirmar]**: `{ "estado": "EN_GESTION" | "DERIVADO" | "DESCARTADO" }`.
- Derivar con la ficha incompleta debe devolver un error 4xx con `ProblemDetail` (regla RF08). Hoy el mock valida esto en el cliente; con el backend hay que mostrar el `detail` del error.

## calificacion (Manual)

Aporta el detalle de la calificación en el panel del lead (RF09, RF10).

| Método | Ruta | Uso en el front |
|---|---|---|
| GET | `/calificaciones/{leadId}` | Calificación vigente con la lista de motivos |
| GET | `/calificaciones/{leadId}/historial` | Historial automático y manual |
| POST | `/calificaciones/{leadId}/correcciones` | Corrección manual del nivel |

- Calificación: `nivel`, `puntaje`, `origen` (`AUTOMATICA` | `MANUAL`), `motivos[]` (cada uno con `regla`, `puntos`, `descripcion`) y `calculadaEn`.
- Corrección: body con el nivel elegido y un **motivo obligatorio** (**[A confirmar]** nombres de campos). Reemplaza el `window.prompt` y el cambio de nivel "alternante" del mock por un selector de nivel + campo de motivo.
- Una corrección **no cambia el estado** del lead; solo nivel y puntaje. Tras corregir, hay que refrescar la ficha y la cola.
- Los puntajes pueden ser negativos (mín. −25 en los casos de referencia); el mock asume `0–100` (`score / 100`), eso hay que corregirlo.

## gateway

- Punto de entrada único (`:8080`), ruteo y CORS.
- El front en producción corre en nginx (`:3000`) y apunta a `VITE_API_URL`.

---

## Qué cambia en el frontend al integrar (resumen)

1. Reemplazar `src/data/vehicles.js` por `GET /vehiculos?disponible=true` y adaptar el formato (los filtros ya funcionan en memoria sobre esa lista).
2. Convertir montos a número antes de enviar y mapear `provincia` al enum.
3. Enviar el preformulario con `POST /leads` y mostrar el `leadId` real en lugar del generado localmente (`DDA-<timestamp>`).
4. Reemplazar `initialLeads` de la cola por `GET /leads?nivel=` y las acciones por `PATCH /leads/{id}/estado`.
5. Cargar motivos e historial desde `calificacion` y usar `POST .../correcciones` para la corrección manual.
6. Manejar errores `ProblemDetail` en todas las llamadas (red caída, 4xx, 5xx).

## Puntos abiertos para el equipo

- Prefijo final de las URLs a través del gateway.
- Nombres exactos de campos del `POST /leads` y de la corrección manual.
- Valores del enum `provincia` y formato de `nivel`/`estado` en las respuestas.
- Campos `caja`, `fotoUrl` (opcional) y `detalle`/versión en vehículos.
- Si `leads` recibe `email` y cómo guarda el nombre (separado o concatenado).
- Si habrá un captcha verificado en servidor.
- Si el item de la cola trae el vehículo embebido.
- Formato de errores de validación por campo.
