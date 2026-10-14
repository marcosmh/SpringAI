import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
app.use(cors({ origin: (origin, callback) => {
  const configuredOrigin = process.env.WEB_ORIGIN || 'http://localhost:5173';
  const isLocalVite = /^http:\/\/(localhost|127\.0\.0\.1):517\d+$/.test(origin || '');
  callback(null, !origin || origin === configuredOrigin || isLocalVite);
} }));
app.use(express.json());

const periodConfig = {
  '30d': { days: 30, previousDays: 30, bucket: 'day' },
  '90d': { days: 90, previousDays: 90, bucket: 'week' },
  '12m': { days: 365, previousDays: 365, bucket: 'month' },
};
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const currency = (value) => Math.round(value * 100) / 100;

app.get('/api/health', async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ status: 'ok', database: 'connected' }); }
  catch { res.status(503).json({ status: 'error', database: 'disconnected' }); }
});

app.get('/api/dashboard', async (req, res, next) => {
  try {
    const period = periodConfig[req.query.period] ? req.query.period : '30d';
    const { days, previousDays, bucket } = periodConfig[period];
    const end = new Date();
    const start = startOfDay(new Date(end.getTime() - days * 86400000));
    const previousStart = new Date(start.getTime() - previousDays * 86400000);
    const [current, previous, allByCategory, recent] = await Promise.all([
      prisma.sale.findMany({ where: { date: { gte: start, lte: end }, status: { not: 'Cancelada' } }, orderBy: { date: 'asc' } }),
      prisma.sale.findMany({ where: { date: { gte: previousStart, lt: start }, status: { not: 'Cancelada' } } }),
      prisma.sale.groupBy({ by: ['category'], where: { date: { gte: start, lte: end }, status: { not: 'Cancelada' } }, _sum: { amount: true }, _count: { _all: true } }),
      prisma.sale.findMany({ orderBy: { date: 'desc' }, take: 8 }),
    ]);
    const revenue = current.reduce((sum, sale) => sum + sale.amount, 0);
    const previousRevenue = previous.reduce((sum, sale) => sum + sale.amount, 0);
    const average = current.length ? revenue / current.length : 0;
    const previousAverage = previous.length ? previousRevenue / previous.length : 0;
    const delta = (a, b) => b === 0 ? (a ? 100 : 0) : ((a - b) / b) * 100;

    const seriesMap = new Map();
    if (bucket === 'day') {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) seriesMap.set(d.toISOString().slice(0, 10), { date: new Date(d).toISOString().slice(0, 10), revenue: 0, orders: 0 });
    } else if (bucket === 'week') {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) { const key = new Date(d).toISOString().slice(0, 10); seriesMap.set(key, { date: key, revenue: 0, orders: 0 }); }
    } else {
      for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d <= end; d.setMonth(d.getMonth() + 1)) { const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; seriesMap.set(key, { date: key, revenue: 0, orders: 0 }); }
    }
    for (const sale of current) {
      const date = new Date(sale.date);
      let key;
      if (bucket === 'day') key = date.toISOString().slice(0, 10);
      else if (bucket === 'week') { const week = new Date(date); week.setDate(week.getDate() - ((week.getDay() + 6) % 7)); key = week.toISOString().slice(0, 10); }
      else key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      if (!seriesMap.has(key)) seriesMap.set(key, { date: key, revenue: 0, orders: 0 });
      const item = seriesMap.get(key); item.revenue += sale.amount; item.orders += 1;
    }
    const previousSeries = new Map();
    for (const sale of previous) {
      const date = new Date(new Date(sale.date).getTime() + days * 86400000);
      let key;
      if (bucket === 'day') key = date.toISOString().slice(0, 10);
      else if (bucket === 'week') { const week = new Date(date); week.setDate(week.getDate() - ((week.getDay() + 6) % 7)); key = week.toISOString().slice(0, 10); }
      else key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      previousSeries.set(key, (previousSeries.get(key) || 0) + sale.amount);
    }
    const orderedSeries = [...seriesMap.values()].sort((a, b) => a.date.localeCompare(b.date));
    const channelMap = new Map();
    for (const sale of current) { const entry = channelMap.get(sale.channel) || { channel: sale.channel, revenue: 0, orders: 0 }; entry.revenue += sale.amount; entry.orders++; channelMap.set(sale.channel, entry); }
    res.json({
      period,
      summary: { revenue: currency(revenue), orders: current.length, averageOrder: currency(average), conversion: 3.84, revenueChange: currency(delta(revenue, previousRevenue)), ordersChange: currency(delta(current.length, previous.length)), averageChange: currency(delta(average, previousAverage)), previousRevenue: currency(previousRevenue), previousOrders: previous.length },
      series: orderedSeries.map((item) => ({ ...item, revenue: currency(item.revenue), previousRevenue: currency(previousSeries.get(item.date) || 0) })),
      categories: allByCategory.map((item) => ({ name: item.category, revenue: currency(item._sum.amount || 0), orders: item._count._all })).sort((a, b) => b.revenue - a.revenue),
      channels: [...channelMap.values()].map((item) => ({ ...item, revenue: currency(item.revenue) })).sort((a, b) => b.revenue - a.revenue),
      recent,
    });
  } catch (error) { next(error); }
});

app.get('/api/sales', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const where = {};
    if (req.query.category) where.category = req.query.category;
    if (req.query.status) where.status = req.query.status;
    if (req.query.q) where.OR = ['customer', 'product', 'category', 'channel'].map((field) => ({ [field]: { contains: String(req.query.q) } }));
    const [data, total] = await Promise.all([prisma.sale.findMany({ where, orderBy: { date: 'desc' }, skip: (page - 1) * limit, take: limit }), prisma.sale.count({ where })]);
    res.json({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

app.post('/api/sales', async (req, res, next) => {
  try {
    const { date, customer, product, category, channel, amount, status = 'Completada' } = req.body;
    if (!customer || !product || !category || !channel || !Number.isFinite(Number(amount)) || Number(amount) <= 0) return res.status(400).json({ error: 'Completa todos los campos y usa un importe mayor que cero.' });
    const sale = await prisma.sale.create({ data: { date: date ? new Date(date) : new Date(), customer, product, category, channel, amount: Number(amount), status } });
    res.status(201).json(sale);
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ error: 'Error interno del servidor.' }); });
app.listen(PORT, '127.0.0.1', () => console.log(`Nexo API escuchando en http://localhost:${PORT}`));
