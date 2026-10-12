# API client

`axiosClient.js` centraliza la conexión con el backend.

Para cambiar la URL, crear un archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:8080/api
VITE_VEHICULOS_API_URL=https://vehiculos.example.com
```

El cliente específico de vehículos está en `vehiclesClient.js` y expone:

- `getVehicles()` para `GET /vehiculos`
- `getVehicleById(id)` para `GET /vehiculos/{id}`
- `getVehiclePrice(id)` para `GET /vehiculos/{id}/precio`
- `getVehiclePriceHistory(id)` para `GET /vehiculos/{id}/historial-precios`

Las respuestas de vehículos se normalizan al formato que utiliza el frontend:
`marca`, `modelo`, `version`, `anio`, `kilometraje`, `precio` y `caja` se
exponen también como `brand`, `model`, `detail`, `year`, `km`, `price` y
`transmission`, respectivamente. Los campos originales se conservan.
