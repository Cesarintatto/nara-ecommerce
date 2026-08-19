import 'dotenv/config';
import { app } from './app';
import { prisma } from './lib/prisma';

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`[NARA API] Escuchando en http://localhost:${PORT}`);
  console.log(`[NARA API] Health: http://localhost:${PORT}/api/v1/health`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
