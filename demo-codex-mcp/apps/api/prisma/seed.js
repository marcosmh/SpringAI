import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const cities = [
  {
    id: 'santiago', name: 'Santiago', country: 'Chile', temperatureC: 22,
    recommendation: 'Puedes usar ropa ligera y una chaqueta delgada para la tarde.',
  },
  {
    id: 'madrid', name: 'Madrid', country: 'España', temperatureC: 16,
    recommendation: 'Conviene llevar una chaqueta ligera durante el día y abrigarte por la tarde y noche.',
  },
  {
    id: 'buenos-aires', name: 'Buenos Aires', country: 'Argentina', temperatureC: 24,
    recommendation: 'Puedes usar ropa fresca y cómoda.',
  },
  {
    id: 'ciudad-de-mexico', name: 'Ciudad de México', country: 'México', temperatureC: 32,
    recommendation: 'Se recomienda camisa de manga corta o sudadera y short.',
  },
];

try {
  for (const city of cities) {
    await prisma.weatherCity.upsert({ where: { id: city.id }, update: city, create: city });
  }
  console.log(`Seed: ${cities.length} ciudades de Spring AI Weather listas.`);
} finally {
  await prisma.$disconnect();
}
