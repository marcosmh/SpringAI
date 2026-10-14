# Nexo Analytics

Monorepo de analítica de negocio: React + Vite en `apps/web` y API Express con Prisma/SQLite en `apps/api`. El dashboard usa un conjunto de datos de demostración editable y persistido en SQLite.

## Requisitos

Node.js 20.19+ o 22.12+, npm.

## Primer arranque

```bash
npm install
npm run db:setup
npm run dev
```

Web: http://localhost:5173 · API: http://localhost:4000/api

`db:setup` crea las tablas y carga datos demo solo cuando la base todavía está vacía. Para volver a cargar datos desde cero, elimina `apps/api/prisma/dev.db` y ejecuta `npm run db:setup`.

## API

- `GET /api/dashboard?period=30d|90d|12m` resumen, serie temporal, comparativa por categoría, canales y registros recientes.
- `GET /api/sales` listado paginado; admite `q`, `category`, `status`, `page`, `limit`.
- `POST /api/sales` alta de una venta.
- `GET /api/health` estado de API y base de datos.

Los datos están generados para demostración; reemplaza el seed por tus datos reales cuando estén disponibles.
