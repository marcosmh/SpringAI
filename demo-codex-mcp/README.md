# Spring AI Weather MCP · Dashboard

Monorepo para explorar la información del proyecto `springai-mcp-server` y `springai-mcp-client`:

- `apps/web`: panel React + Vite con comparación de las temperaturas conocidas por `WeatherTools`, recomendaciones de vestimenta, historial y formulario de consulta.
- `apps/api`: API Express que almacena las ciudades, las preguntas, las respuestas y el estado de cada consulta mediante Prisma y SQLite. Reenvía las preguntas al endpoint Spring AI del cliente.

El catálogo refleja las cuatro ciudades y los valores definidos en `WeatherTools`: Santiago (22 °C), Madrid (16 °C), Buenos Aires (24 °C) y Ciudad de México (32 °C). La herramienta actual no publica series históricas, pronóstico, humedad ni viento; el dashboard no inventa esos datos. Las consultas que hagas sí quedan registradas para consultar el historial.

## Arranque

Requisitos: Node.js 20.19+ o 22.12+, npm. Para obtener respuestas generadas por el asistente, también deben estar activos el servidor MCP de clima (puerto 8081), el cliente Spring AI (puerto 8080) y Ollama con el modelo configurado.

```bash
npm install
npm run db:setup
npm run dev
```

Web: http://localhost:5173 · Express: http://localhost:4000/api · Spring AI: http://localhost:8080/api/weather/ask

La comparación de ciudades y recomendaciones se cargan desde SQLite y funcionan sin Ollama. Si Spring AI no está disponible, las consultas se guardan igualmente con la respuesta de referencia local y el historial marca `Dato local`.

## Rutas de Express

- `GET /api/weather/dashboard`: ciudades, temperatura media, extremos, rango e historial reciente.
- `GET /api/weather/queries`: historial paginado; filtros `q`, `cityId`, `page`, `limit`.
- `POST /api/weather/ask`: cuerpo `{ "cityId": "santiago", "question": "..." }`; invoca Spring AI y guarda consulta/respuesta.
- `GET /api/health`: estado de SQLite.

La base local se crea en `apps/api/prisma/dev.db`. `npm run db:setup` aplica el esquema y sincroniza el catálogo de ciudades; las consultas existentes se conservan.
