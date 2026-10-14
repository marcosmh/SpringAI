import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const categories = [
  ['Tecnología', 0.29, '#725cf5'],
  ['Hogar', 0.23, '#28b89a'],
  ['Moda', 0.21, '#f1a94e'],
  ['Deportes', 0.16, '#5494eb'],
  ['Otros', 0.11, '#e47e91'],
];
const products = {
  Tecnología: ['Auriculares Pro', 'Teclado mecánico', 'Monitor 27”', 'Smartwatch'],
  Hogar: ['Lámpara Nórdica', 'Cafetera Barista', 'Set de sábanas', 'Silla de diseño'],
  Moda: ['Chaqueta urbana', 'Zapatillas clásicas', 'Bolso de piel', 'Reloj minimal'],
  Deportes: ['Mat de yoga', 'Mancuernas 10 kg', 'Botella térmica', 'Banda elástica'],
  Otros: ['Libro de fotografía', 'Kit de café', 'Planta de interior', 'Vela aromática'],
};
const customers = ['Olivia Martínez', 'Diego Herrera', 'Camila Torres', 'Mateo García', 'Valentina Cruz', 'Santiago López', 'Isabella Ruiz', 'Daniel Vega', 'Lucía Flores', 'Emiliano Reyes', 'Renata Soto', 'Leonardo Díaz', 'Paula Mendoza', 'Andrés Navarro', 'Mariana Castillo'];
const channels = ['Web', 'Tienda', 'Marketplace'];
const statuses = ['Completada', 'Completada', 'Completada', 'Pendiente', 'Cancelada'];
const pick = (arr, n) => arr[Math.floor(Math.abs(Math.sin(n * 9301 + 49297) * 233280) % arr.length)];

try {
  if (await prisma.sale.count() === 0) {
    const now = new Date();
    const rows = [];
    for (let i = 0; i < 320; i++) {
      const daysAgo = Math.floor(Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 365);
      const category = pick(categories.map(([name]) => name), i * 3 + 1);
      const product = pick(products[category], i * 5 + 2);
      const base = 350 + Math.abs(Math.sin(i * 3.71) * 14500);
      const date = new Date(now);
      date.setDate(now.getDate() - daysAgo);
      date.setHours(10 + (i % 10), (i * 17) % 60, 0, 0);
      rows.push({
        date,
        customer: pick(customers, i * 7 + 3),
        product,
        category,
        channel: pick(channels, i * 11 + 4),
        amount: Math.round(base * 100) / 100,
        status: pick(statuses, i * 13 + 8),
      });
    }
    await prisma.sale.createMany({ data: rows });
    console.log(`Seed: ${rows.length} ventas de demostración creadas.`);
  } else {
    console.log('Seed omitido: ya existen registros.');
  }
} finally {
  await prisma.$disconnect();
}
