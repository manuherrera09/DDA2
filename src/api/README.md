# API client

`axiosClient.js` centraliza la conexión con el backend.

Para cambiar la URL, crear un archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:8080/api
```

Las funciones específicas de cada recurso pueden agregarse aquí cuando se definan los endpoints del backend.
