import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 4000);
const SPRING_AI_URL = process.env.SPRING_AI_URL || 'http://127.0.0.1:8080/api/weather/ask';

app.use(cors({ origin: (origin, callback) => {
  const configuredOrigin = process.env.WEB_ORIGIN || 'http://localhost:5173';
  const isLocalVite = /^http:\/\/(localhost|127\.0\.0\.1):517\d+$/.test(origin || '');
  callback(null, !origin || origin === configuredOrigin || isLocalVite);
} }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', springAiUrl: SPRING_AI_URL });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/api/weather/dashboard', async (_req, res, next) => {
  try {
    const [cities, queryCount, successfulCount, latestQueries, cityQueryCounts] = await Promise.all([
      prisma.weatherCity.findMany({ orderBy: { temperatureC: 'desc' } }),
      prisma.weatherQuery.count(),
      prisma.weatherQuery.count({ where: { success: true } }),
      prisma.weatherQuery.findMany({ include: { city: true }, orderBy: { askedAt: 'desc' }, take: 8 }),
      prisma.weatherQuery.groupBy({ by: ['cityId'], _count: { _all: true } }),
    ]);
    const queryCounts = new Map(cityQueryCounts.map((item) => [item.cityId, item._count._all]));
    const temperatures = cities.map((city) => city.temperatureC);
    const average = temperatures.length ? temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length : 0;
    res.json({
      source: 'Spring AI Weather MCP',
      cities: cities.map((city) => ({ ...city, deviationC: Number((city.temperatureC - average).toFixed(1)), queryCount: queryCounts.get(city.id) || 0 })),
      summary: {
        cities: cities.length,
        averageC: Number(average.toFixed(1)),
        warmest: cities[0] || null,
        coldest: cities.at(-1) || null,
        temperatureRangeC: temperatures.length ? Math.max(...temperatures) - Math.min(...temperatures) : 0,
        queries: queryCount,
        successfulQueries: successfulCount,
      },
      latestQueries,
    });
  } catch (error) { next(error); }
});

app.get('/api/weather/queries', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const where = {};
    if (req.query.cityId) where.cityId = String(req.query.cityId);
    if (req.query.q) where.question = { contains: String(req.query.q) };
    const [data, total] = await Promise.all([
      prisma.weatherQuery.findMany({ where, include: { city: true }, orderBy: { askedAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.weatherQuery.count({ where }),
    ]);
    res.json({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

app.post('/api/weather/ask', async (req, res, next) => {
  try {
    const { cityId, question } = req.body || {};
    const city = await prisma.weatherCity.findUnique({ where: { id: String(cityId || '') } });
    if (!city) return res.status(400).json({ error: 'Selecciona una de las ciudades disponibles.' });
    if (typeof question !== 'string' || !question.trim()) return res.status(400).json({ error: 'Escribe una pregunta sobre el clima.' });

    const cleanQuestion = question.trim().slice(0, 500);
    const questionForModel = `Ciudad: ${city.name}. ${cleanQuestion}`;
    const startedAt = Date.now();
    let answer;
    let success = false;
    let errorMessage = null;
    try {
      const target = new URL(SPRING_AI_URL);
      target.searchParams.set('question', questionForModel);
      const response = await fetch(target, { signal: AbortSignal.timeout(70000) });
      const body = await response.text();
      if (!response.ok) throw new Error(`Spring AI respondió HTTP ${response.status}.`);
      answer = body.trim();
      success = true;
    } catch (error) {
      errorMessage = error.name === 'TimeoutError' ? 'Spring AI tardó demasiado en responder.' : `No se pudo contactar Spring AI en ${SPRING_AI_URL}.`;
      answer = `${errorMessage} La referencia local de ${city.name} es ${city.temperatureC} °C. ${city.recommendation}`;
    }

    const record = await prisma.weatherQuery.create({
      data: {
        cityId: city.id,
        question: cleanQuestion,
        answer,
        temperatureC: city.temperatureC,
        success,
        latencyMs: Date.now() - startedAt,
      },
      include: { city: true },
    });
    res.status(success ? 201 : 200).json({ ...record, warning: errorMessage });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor.' : error.message });
});

app.listen(PORT, '127.0.0.1', () => console.log(`Weather API disponible en http://127.0.0.1:${PORT}`));
